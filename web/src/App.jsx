import { useState, useEffect } from 'react';
import data from './data/xuanfopu.json';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Reader from './components/Reader.jsx';
import Game from './components/Game.jsx';
import { convert } from './lib/convert.js';

// 回到顶部浮动按钮（滚动一段后显示）
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button className="back-top" aria-label="回到頂部" title="回到頂部"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
  );
}

export default function App() {
  const [script, setScript] = useState('hant');           // 默认繁体；hant(繁) | cn(简)
  const [section, setSection] = useState({ type: 'preface' });
  const [navOpen, setNavOpen] = useState(false);          // 移动端抽屉目录开关
  const [mode, setMode] = useState('read');               // read 阅读 | game 游戏

  // 切换章节后收起抽屉并回到顶部
  const go = (s) => {
    setSection(s);
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cv = (s) => convert(s, script, 'hant');

  return (
    <>
      <Header script={script} setScript={setScript} onMenu={() => setNavOpen((v) => !v)} mode={mode} setMode={setMode} />
      {mode === 'read' ? (
        <div className="layout">
          <Nav data={data} section={section} go={go} script={script} open={navOpen} onClose={() => setNavOpen(false)} />
          <Reader data={data} section={section} script={script} />
        </div>
      ) : (
        <Game script={script} />
      )}
      <footer className="app-footer">
        {cv('選佛譜 · 北天目蕅益沙門智旭 述 · 原文據 CBETA《大藏經補編》No.136 · 原文白話對照研讀')}
      </footer>
      <BackToTop />
    </>
  );
}
