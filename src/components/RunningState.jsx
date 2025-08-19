import { useState, useEffect } from 'react';
import useWatchLocation from '../hooks/useWatchLocation';
import { getDistanceFromLatLonInKm } from '../utils/location';

const RunningState = () => {
    const [startTime] = useState(new Date());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const [prevLocation, setPrevLocation] = useState(null);
    const { location } = useWatchLocation();

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setElapsedTime(Math.round((now - startTime) / 1000));
        }, 1000);

        return () => clearInterval(timer);
    }, [startTime]);

    useEffect(() => {
        if (location && prevLocation) {
            const newDistance = getDistanceFromLatLonInKm(
                prevLocation.latitude,
                prevLocation.longitude,
                location.latitude,
                location.longitude
            );
            setDistance((prevDistance) => prevDistance + newDistance);
        }
        setPrevLocation(location);
    }, [location, prevLocation]);

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        // paddingTop으로 버튼을 위한 공간을 확보하고, 컨테이너 높이는 카드 콘텐츠에 따라 결정됩니다.
        <div style={{width: '100%', position: 'relative', paddingTop: 30}}>
            {/* 버튼들은 오른쪽 상단에 절대 위치로 고정됩니다. */}
            <div style={{width: 60, height: 60, right: 80, top: 0, position: 'absolute'}}>
                <div style={{
                    width: 60,
                    height: 60,
                    left: 0,
                    top: 0,
                    position: 'absolute',
                    background: 'var(--main, #FF8C42)',
                    borderRadius: 18
                }}/>
                <div style={{
                    width: 3.75,
                    height: 24,
                    left: 35.25,
                    top: 18,
                    position: 'absolute',
                    background: '#FCFCFC',
                    borderRadius: 4.50
                }}/>
                <div style={{
                    width: 3.75,
                    height: 24,
                    left: 21,
                    top: 18,
                    position: 'absolute',
                    background: '#FCFCFC',
                    borderRadius: 4.50
                }}/>
            </div>
            <div style={{width: 60, height: 60, right: 10, top: 0, position: 'absolute'}}>
                <div style={{
                    width: 60,
                    height: 60,
                    left: 0,
                    top: 0,
                    position: 'absolute',
                    background: '#1E1E22',
                    borderRadius: 18
                }}/>
                <div style={{
                    width: 24,
                    height: 24,
                    left: 18,
                    top: 18,
                    position: 'absolute',
                    background: '#FCFCFC',
                    borderRadius: 4.50
                }}/>
            </div>

            {/* 카드는 일반적인 흐름에 따라 배치됩니다. */}
            <div style={{
                padding: '21px 14px',
                background: 'white',
                boxShadow: '0px 4px 28px rgba(46, 49, 118, 0.10)',
                borderRadius: 16,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 8,
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <div style={{
                    width: '100%',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    gap: 2,
                    display: 'flex'
                }}>
                    <div style={{
                        alignSelf: 'stretch',
                        opacity: 0.70,
                        color: '#3A3A3C',
                        fontSize: 16,
                        fontFamily: 'Pretendard',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                    }}>달린 시간
                    </div>
                    <div style={{
                        alignSelf: 'stretch',
                        color: '#3A3A3C',
                        fontSize: 36,
                        fontFamily: 'Inter',
                        fontWeight: '600',
                        letterSpacing: 0.36,
                        wordWrap: 'break-word'
                    }}>{formatTime(elapsedTime)}
                    </div>
                </div>
                <div style={{
                    padding: '8px 12px',
                    background: '#FFF4EC',
                    borderRadius: 8,
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    gap: 8,
                    display: 'flex',
                    width: '100%',
                }}>
                    <div style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 4,
                        display: 'flex'
                    }}>
                        <div style={{
                            fontSize: 'clamp(18px, 4vw, 20px)',
                            fontFamily: 'Pretendard',
                            fontWeight: '600',
                        }}>🏃
                        </div>
                        <div style={{
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-end',
                            display: 'inline-flex'
                        }}>
                            <div style={{
                                fontSize: 'clamp(16px, 4vw, 22px)',
                                fontWeight: '600',
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>{distance.toFixed(1)}
                            </div>
                            <div style={{
                                opacity: 0.70,
                                fontSize: 11,
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>km
                            </div>
                        </div>
                    </div>
                    <div style={{width: 1, height: 44, opacity: 0.10, background: '#333333'}}/>
                    <div
                        style={{justifyContent: 'center', alignItems: 'center', display: 'flex', gap: 4}}>
                        <div style={{
                            fontSize: 'clamp(18px, 4vw, 22px)',
                            fontWeight: '600',
                            fontFamily: 'Pretendard',
                        }}>🔥
                        </div>
                        <div style={{
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-end',
                            display: 'inline-flex'
                        }}>
                            <div style={{
                                fontSize: 'clamp(16px, 4vw, 22px)',
                                fontWeight: '600',
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>139
                            </div>
                            <div style={{
                                opacity: 0.70,
                                fontSize: 11,
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>kcal
                            </div>
                        </div>
                    </div>
                    <div style={{width: 1, height: 44, opacity: 0.10, background: '#333333'}}/>
                    <div style={{justifyContent: 'center', alignItems: 'center', gap: 8, display: 'flex'}}>
                        <div style={{
                            fontSize: 'clamp(18px, 4vw, 22px)',
                            fontWeight: '600',
                            fontFamily: 'Pretendard',
                        }}>⚡️
                        </div>
                        <div style={{
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-end',
                            display: 'inline-flex'
                        }}>
                            <div style={{
                                fontSize: 'clamp(16px, 4vw, 22px)',
                                fontWeight: '600',
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>9’01’’
                            </div>
                            <div style={{
                                opacity: 0.70,
                                fontSize: 11,
                                color: '#3A3A3C',
                                fontFamily: 'Pretendard',
                            }}>pace
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RunningState