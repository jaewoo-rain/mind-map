// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

if (!process.env.TMAP_APP_KEY) {
  console.warn(
    "[WARN] .env에 TMAP_APP_KEY가 없습니다. 요청이 실패할 수 있어요."
  );
}

app.use(cors({ origin: "*" }));
app.use(express.json());

// 헬스체크
app.get("/health", (_, res) => res.json({ ok: true }));

/**
 * 보행자 경로 프록시
 * GET /api/tmap/pedestrian?startLng=...&startLat=...&goalLng=...&goalLat=...&searchOption=0
 * - searchOption(문자열): 기본 '0'(추천). 필요시 문서 옵션으로 변경
 */
app.get("/api/tmap/pedestrian", async (req, res) => {
  try {
    const {
      startLng,
      startLat,
      goalLng,
      goalLat,
      searchOption = "0",
    } = req.query;
    if (![startLng, startLat, goalLng, goalLat].every(Boolean)) {
      return res.status(400).json({
        ok: false,
        message: "startLng, startLat, goalLng, goalLat는 필수입니다.",
      });
    }

    // 티맵은 X=lng, Y=lat, 좌표계는 WGS84GEO 권장
    const body = {
      startX: Number(startLng),
      startY: Number(startLat),
      endX: Number(goalLng),
      endY: Number(goalLat),
      startName: "출발지",
      endName: "도착지",
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",
      searchOption: String(searchOption), // "0" 추천
      sort: "index",
    };

    const url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1";

    const r = await axios.post(url, body, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        appKey: process.env.TMAP_APP_KEY, // ← 인증 헤더
      },
      timeout: 15000,
    });

    const data = r.data;

    // GeoJSON FeatureCollection 에서 LineString 좌표들을 순서대로 수집
    let path = [];
    if (data?.type === "FeatureCollection" && Array.isArray(data?.features)) {
      for (const f of data.features) {
        if (
          f?.geometry?.type === "LineString" &&
          Array.isArray(f.geometry.coordinates)
        ) {
          // coordinates: [[lng, lat], ...]
          path.push(...f.geometry.coordinates);
        }
      }
    }

    if (!path.length) {
      return res.status(502).json({
        ok: false,
        message: "보행자 경로를 찾지 못했습니다.",
        raw: process.env.NODE_ENV === "development" ? data : undefined,
      });
    }

    // 총거리/총시간 요약(있으면)
    let summary = null;
    const sp = data.features?.find(
      (f) =>
        f?.properties?.pointType === "SP" &&
        (f?.properties?.totalDistance || f?.properties?.totalTime)
    );
    if (sp?.properties) {
      summary = {
        totalDistance: sp.properties.totalDistance,
        totalTime: sp.properties.totalTime,
      };
    }

    res.json({ ok: true, path, summary });
  } catch (e) {
    console.error("[tmap pedestrian] error:", e?.response?.data || e.message);
    res.status(500).json({
      ok: false,
      message: "Tmap 보행자 경로 요청 실패",
      detail: e?.response?.data || e.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tmap proxy running: http://localhost:${PORT}`);
});
