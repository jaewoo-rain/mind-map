import React from 'react';
import { useNavigate } from 'react-router-dom';

const Icon = ({ name, active }) => {
  const color = active ? 'black' : '#626264';

  const icons = {
    feed: (
      <div data-property-1={`feed_${active ? 'active' : 'default'}`} style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 6.21, height: 6.75, left: 12.65, top: 4.50, position: 'absolute', background: color }} />
        <div style={{ width: 13.50, height: 5.25, left: 9, top: 14.25, position: 'absolute', background: color }} />
        <div style={{ width: 4.98, height: 5.44, left: 4.40, top: 6, position: 'absolute', background: color }} />
        <div style={{ width: 8.16, height: 4.19, left: 1.50, top: 13.81, position: 'absolute', background: color }} />
      </div>
    ),
    running: (
      <div data-property-1={`running_${active ? 'active' : 'default'}`} style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 20, height: 18.50, left: 2, top: 2.50, position: 'absolute', background: color }} />
      </div>
    ),
    activity: (
      <div data-property-1={`activity_${active ? 'active' : 'default'}`} style={{ width: 24, height: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 21.50, height: 1.50, left: 1.25, top: 20.50, position: 'absolute', background: color }} />
        <div style={{ width: 4.50, height: 20, left: 9.75, top: 2, position: 'absolute', background: color }} />
        <div style={{ width: 4, height: 14, left: 3, top: 8, position: 'absolute', background: color }} />
        <div style={{ width: 4, height: 9, left: 17, top: 13, position: 'absolute', background: color }} />
      </div>
    ),
  };

  return icons[name] || null;
};

const TabItem = ({ name, label, active, onClick }) => {
  const color = active ? 'black' : '#626264';
  return (
    <div onClick={() => onClick(name)} style={{ flex: '1 1 0', height: 56, paddingTop: 8, paddingBottom: 8, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2, display: 'inline-flex', cursor: 'pointer' }}>
      <Icon name={name} active={active} />
      <div style={{ alignSelf: 'stretch', textAlign: 'center', color: color, fontSize: 11, fontFamily: 'Pretendard', fontWeight: '400', lineHeight: '15.40px', wordWrap: 'break-word' }}>{label}</div>
    </div>
  );
};

const BottomBar = ({ activeTab = "running" }) => {
    const navigate = useNavigate();
    const tabs = [
        { id: 'feed', label: '피드', path: '/feed' },
        { id: 'running', label: '러닝', path: '/recommend' },
        { id: 'activity', label: '활동', path: '/activity' },
    ];

    const handleTabClick = (tabId) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab && tab.path) {
            navigate(tab.path);
        }
    };

    return (
        <div style={{width: '100%', background: 'white', overflow: 'hidden', borderTop: '0.50px #C4C4C6 solid', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
                {tabs.map(tab => (
                    <TabItem
                        key={tab.id}
                        name={tab.id}
                        label={tab.label}
                        active={activeTab === tab.id}
                        onClick={handleTabClick}
                    />
                ))}
            </div>
            <div style={{alignSelf: 'stretch', height: 14, position: 'relative'}}>
                <div style={{width: '100%', height: 24, left: 0, top: -5, position: 'absolute'}}>
                    <div style={{width: 128.96, height: 4.48, left: '50%', transform: 'translateX(-50%)', top: 16.84, position: 'absolute', background: 'var(--Labels-Primary, black)', borderRadius: 89.55}} />
                </div>
            </div>
        </div>
    )
}

export default BottomBar;