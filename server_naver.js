// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// === 기본 설정 ===
app.use(cors({ origin: "*" }));
app.use(express.json());

// 시작 시 환경 체크(비밀키는 노출 X)
console.log("ENV check:", {
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID || "(missing)",
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET
    ? "(loaded)"
    : "(missing)",
});

const MAPS_API_BASE = "https://maps.apigw.ntruss.com";

// 헬스체크
app.get("/health", (_, res) => res.json({ ok: true }));

/**
 * GET /api/directions15
 * 예) /api/directions15?startLng=126.9768&startLat=37.5759&goalLng=126.9778&goalLat=37.5692&option=fast
 * - 외부 엔드포인트: https://maps.apigw.ntruss.com/map-direction-15/v1/driving
 * - 파라미터: start=lng,lat / goal=lng,lat
 * - 응답 파싱: routes[].sections[].roads[].vertexes -> [lng,lat,lng,lat,...]를 [[lng,lat], ...]로 변환
 * - (보조) 구버전 스타일 route.traoptimal[0].path 등도 파싱
 */
app.get("/api/directions15", async (req, res) => {
  try {
    const { startLng, startLat, goalLng, goalLat, option = "fast" } = req.query;

    if (!startLng || !startLat || !goalLng || !goalLat) {
      return res.status(400).json({
        ok: false,
        message: "startLng, startLat, goalLng, goalLat는 필수입니다.",
      });
    }

    const url = `${MAPS_API_BASE}/map-direction-15/v1/driving`;
    const params = {
      start: `${startLng},${startLat}`, // "lng,lat"
      goal: `${goalLng},${goalLat}`,
      option, // fast | shortest | traffics | free ...
    };

    // 요청 로그(Secret은 마스킹)
    console.log("[dir15] request", {
      url,
      params,
      id: process.env.NAVER_CLIENT_ID,
      secret: process.env.NAVER_CLIENT_SECRET ? "***" : "MISSING",
    });

    const r = await axios.get(url, {
      params,
      headers: {
        "x-ncp-apigw-api-key-id": process.env.NAVER_CLIENT_ID,
        "x-ncp-apigw-api-key": process.env.NAVER_CLIENT_SECRET,
        Accept: "application/json",
      },
      timeout: 10000,
      // 4xx/5xx도 body를 보게 두고 그대로 반환
      validateStatus: () => true,
    });

    // 비정상 상태코드인 경우, 네이버 응답 그대로 전달
    if (r.status !== 200) {
      console.error("[dir15] Naver HTTP", r.status, r.data);
      return res.status(r.status).json({ ok: false, from: "naver", ...r.data });
    }
    if (r.data?.error) {
      console.error("[dir15] Naver error body", r.data);
      return res.status(502).json({ ok: false, from: "naver", ...r.data });
    }

    const data = r.data;

    // ---- v15 정식 파싱 (routes[].sections[].roads[].vertexes) ----
    let path = null;

    if (Array.isArray(data?.routes) && data.routes.length > 0) {
      const firstRoute = data.routes[0];
      const pts = [];

      for (const sec of firstRoute.sections || []) {
        for (const rd of sec.roads || []) {
          const v = rd.vertexes || [];
          for (let i = 0; i < v.length - 1; i += 2) {
            const lng = v[i];
            const lat = v[i + 1];
            if (typeof lng === "number" && typeof lat === "number") {
              pts.push([lng, lat]);
            }
          }
        }
      }
      if (pts.length > 1) path = pts;
    }

    // ---- (보조) 구버전 스타일(route.traoptimal[0].path 등)도 대응 ----
    if (!path) {
      path =
        data?.route?.trafast?.[0]?.path ||
        data?.route?.traoptimal?.[0]?.path ||
        data?.route?.tracomfort?.[0]?.path ||
        null;
    }

    if (!path) {
      console.warn("[dir15] no path in body", data);
      return res.status(502).json({
        ok: false,
        message: "Directions 15 응답에서 경로(path)를 찾지 못했습니다.",
        raw: process.env.NODE_ENV === "development" ? data : undefined,
      });
    }

    // 요약 정보도 가능하면 포함 (v15 혹은 v5 스타일 둘 다 커버)
    const summary = data?.routes?.[0]?.summary || data?.route?.summary || null;

    res.json({ ok: true, path, summary });
  } catch (e) {
    console.error("Directions15 Error:", e?.response?.data || e.message);
    res.status(500).json({
      ok: false,
      message: "Failed to fetch directions15",
      detail: e?.response?.data || e.message,
    });
  }
});

// (선택) 지오코딩 프록시 - 키 정상/권한 점검용
app.get("/api/geocode", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res
        .status(400)
        .json({ ok: false, message: "query 파라미터가 필요합니다." });

    const url = `${MAPS_API_BASE}/map-geocode/v2/geocode`;
    const r = await axios.get(url, {
      params: { query },
      headers: {
        "x-ncp-apigw-api-key-id": process.env.NAVER_CLIENT_ID,
        "x-ncp-apigw-api-key": process.env.NAVER_CLIENT_SECRET,
      },
      timeout: 10000,
      validateStatus: () => true,
    });

    if (r.status !== 200) {
      return res.status(r.status).json({ ok: false, from: "naver", ...r.data });
    }
    res.json({ ok: true, ...r.data });
  } catch (e) {
    console.error("Geocode Error:", e?.response?.data || e.message);
    res.status(500).json({
      ok: false,
      message: "Failed to geocode",
      detail: e?.response?.data || e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
