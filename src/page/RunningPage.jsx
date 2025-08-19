import React, { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import "./MapPage.css";
import { getDistanceFromLatLonInKm } from "../utils/location.js";
import AlertArrive from "../components/AlertArrive.jsx";

const NAVER_KEY = import.meta.env.VITE_NAVER_CLIENT_ID;

/** 네이버 지도 스크립트 동적 로더 */
function loadNaverMaps(clientId) {
    return new Promise((resolve, reject) => {
        if (typeof window !== "undefined" && window.naver?.maps) {
            resolve(window.naver);
            return;
        }
        const id = "naver-maps-script";
        const existing = document.getElementById(id);
        if (existing) {
            existing.addEventListener("load", () => resolve(window.naver), {
                once: true,
            });
            existing.addEventListener("error", (e) => reject(e), { once: true });
            return;
        }
        const s = document.createElement("script");
        s.id = id;
        s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve(window.naver);
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });
}

export default function RunningPage() {
    const location = useLocation();
    // RecommendedCourse 페이지에서 navigate로 전달한 state를 받습니다.
    // state가 없거나 courseId가 없는 경우 기본값으로 '1-1'을 사용합니다.
    const selectedCourseId = location.state?.courseId || "1-1";
    const [mapErr, setMapErr] = useState("");
    const [courseData, setCourseData] = useState(null);
    const [pointsOfInterest, setPointsOfInterest] = useState([]);
    const [visitedSpots, setVisitedSpots] = useState(new Set());
    const [arrivalAlert, setArrivalAlert] = useState(null);

    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const routeLinesRef = useRef([]); // Polyline 배열을 저장할 ref

    // 1. 코스 데이터 불러오기
    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await fetch(`/data/course_bundles/course_${selectedCourseId}.json`);
                if (!response.ok) {
                    throw new Error(`코스 데이터를 불러올 수 없습니다: ${selectedCourseId}`);
                }
                const data = await response.json();
                setCourseData(data);

                const spots = data.spots || [];
                const guides = data.guide_points || [];
                const allPoints = [...spots, ...guides].filter(p => p.lat && p.lng && p.name);
                setPointsOfInterest(allPoints);
            } catch (error) {
                console.error("코스 데이터 로딩 실패:", error);
                setMapErr(error.message);
            }
        };
        fetchCourseData();
    }, [selectedCourseId]);

    // 2. 지도 초기화 및 경로 그리기
    useEffect(() => {
        if (!courseData || !courseData.lines || courseData.lines.length === 0) return;

        let cancelled = false;

        const initMap = async () => {
            try {
                if (!NAVER_KEY) {
                    setMapErr("네이버 클라이언트 ID가 없습니다.");
                    return;
                }
                const naver = await loadNaverMaps(NAVER_KEY);
                if (cancelled) return;

                const allCoords = courseData.lines.flat();
                if (allCoords.length < 2) return;

                const startCoord = allCoords[0];
                const startLatLng = new naver.maps.LatLng(startCoord[1], startCoord[0]);

                const map = new naver.maps.Map(mapContainerRef.current, {
                    center: startLatLng,
                    zoom: 15,
                    mapDataControl: false,
                });
                mapRef.current = map;

                const endCoord = allCoords[allCoords.length - 1];
                const endLatLng = new naver.maps.LatLng(endCoord[1], endCoord[0]);
                new naver.maps.Marker({ position: startLatLng, map, title: "출발" });
                new naver.maps.Marker({ position: endLatLng, map, title: "도착" });

                routeLinesRef.current.forEach(line => line.setMap(null));
                
                const polylines = courseData.lines.map((segment) => {
                    const path = segment.map(([lng, lat]) => new naver.maps.LatLng(lat, lng));
                    return new naver.maps.Polyline({
                        path,
                        strokeColor: "#0064FF",
                        strokeOpacity: 0.9,
                        strokeWeight: 7,
                        map,
                    });
                });
                
                routeLinesRef.current = polylines;

                const bounds = new naver.maps.LatLngBounds();
                courseData.lines.forEach(segment => {
                    segment.forEach(([lng, lat]) => bounds.extend(new naver.maps.LatLng(lat, lng)));
                });
                map.fitBounds(bounds, { top: 100, right: 50, bottom: 100, left: 50 });

            } catch (e) {
                console.error(e);
                setMapErr(`지도 초기화 실패: ${e.message || e}`);
            }
        };

        initMap();
        return () => {
            cancelled = true;
            routeLinesRef.current.forEach(line => line.setMap(null));
            routeLinesRef.current = [];
        };
    }, [courseData]);

    // 3. 사용자 위치 추적 및 도착 확인
    useEffect(() => {
        if (pointsOfInterest.length === 0) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude: currentLat, longitude: currentLng } = position.coords;

                pointsOfInterest.forEach(point => {
                    if (visitedSpots.has(point.name) || arrivalAlert) return;

                    const distanceInKm = getDistanceFromLatLonInKm(
                        currentLat,
                        currentLng,
                        point.lat,
                        point.lng
                    );

                    if (distanceInKm * 1000 <= 50) { // 50미터 이내
                        setVisitedSpots(prev => new Set(prev).add(point.name));
                        
                        setArrivalAlert(
                            <AlertArrive
                                spotName={point.name}
                                onClose={() => setArrivalAlert(null)}
                                onTakePhoto={() => {
                                    console.log(`사진찍기 액션: ${point.name}`);
                                    setArrivalAlert(null);
                                }}
                            />
                        );
                    }
                });
            },
            (error) => {
                console.error("위치 추적 오류:", error);
                setMapErr("위치 정보를 가져올 수 없습니다.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [pointsOfInterest, visitedSpots, arrivalAlert]);

    return (
        <div className="screen">
            <div ref={mapContainerRef} className="map-container" />
            {mapErr && <div style={{ position: 'absolute', top: 10, left: 10, background: 'red', color: 'white', padding: 10, borderRadius: 5 }}>{mapErr}</div>}
            {arrivalAlert}
        </div>
    );
}