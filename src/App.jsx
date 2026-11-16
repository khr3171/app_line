import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  HeartHandshake,
  Sprout,
  BriefcaseBusiness,
  ContactRound,
  CalendarDays,
  Settings,
  Search,
  ChevronRight,
  ChevronLeft,
  Plus,
  ShieldCheck,
  LogOut,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Check,
  LockKeyhole,
  Building2,
  SlidersHorizontal,
  FileText,
  Clock,
  MessageSquare,
  Link,
  AlertCircle,
  Menu,
  KeyRound,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { call, DEMO } from "./service";
import {
  CHILD,
  YOUTH,
  STATUS,
  formatDate,
  formatTime,
  matchesServices,
} from "./data";
import "./style.css";

function Mark({ small = false }) {
  return (
    <span className={"mark " + (small ? "small" : "")} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
function Art() {
  return (
    <div className="art" aria-hidden="true">
      {[
        [8, 12, 32, "purple"],
        [21, 7, 25, "yellow"],
        [15, 29, 58, "teal"],
        [30, 35, 36, "blue"],
        [16, 64, 58, "coral"],
        [28, 65, 35, "yellow"],
        [8, 80, 33, "green"],
        [27, 83, 26, "blue"],
        [45, 49, 51, "purple"],
        [56, 37, 34, "green"],
        [61, 24, 27, "blue"],
        [71, 48, 59, "yellow"],
        [80, 30, 31, "green"],
        [81, 61, 49, "blue"],
        [92, 43, 61, "coral"],
        [100, 28, 30, "yellow"],
        [102, 59, 48, "teal"],
        [91, 78, 35, "purple"],
        [68, 76, 31, "teal"],
      ].map(([x, y, s, c], i) => (
        <span
          key={i}
          className={c}
          style={{ left: x + "%", top: y + "%", width: s, height: s }}
        />
      ))}
      <div className="art-line" />
      <div className="art-dash" />
    </div>
  );
}
function Badge({ value }) {
  return (
    <span className={"badge status-" + STATUS.indexOf(value)}>
      <b />
      {value}
    </span>
  );
}
function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={"modal " + (wide ? "wide" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header>
          <h2>{title}</h2>
          <button className="icon" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function Login({ onLogin, notify }) {
  const [role, setRole] = useState("admin"),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await call("login", { role, username, password });
      onLogin(r.user);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <header className="login-header">
        <a href="#" className="brand">
          <Mark />
          <span>
            선을 넘어, 함께<small>경계선지능인 지원사업</small>
          </span>
        </a>
        <span className="header-note">사람과 서비스를 잇는 따뜻한 연결</span>
      </header>
      <main className="login-main">
        <section className="login-story">
          <span className="eyebrow">BORDERLESS, TOGETHER</span>
          <Art />
          <div className="story-copy">
            <p>경계선지능인 지원사업</p>
            <h1>
              선을 넘어,
              <br />
              함께 성장하는 내일.
            </h1>
            <div className="intro">
              한 사람의 가능성이 더 넓은 세상으로 이어지도록.
              <br />
              접수부터 맞춤형 서비스 연계까지 함께합니다.
            </div>
            <div className="story-chips">
              <span>
                <Sprout size={17} /> 각자의 속도로
              </span>
              <span>
                <HeartHandshake size={17} /> 함께하는 연결
              </span>
            </div>
          </div>
        </section>
        <section className="login-box">
          <div className="login-heading">
            <span className="tiny-icon">
              <HeartHandshake size={24} />
            </span>
            <p className="eyebrow">통합접수창구 관리시스템</p>
            <h2>반갑습니다.</h2>
            <p>함께할 내일을 위해 로그인해 주세요.</p>
          </div>
          <div className="role-tabs">
            <button
              className={role === "admin" ? "active" : ""}
              onClick={() => setRole("admin")}
            >
              <ShieldCheck size={17} />
              사서원 관리자
            </button>
            <button
              className={role === "agency" ? "active" : ""}
              onClick={() => setRole("agency")}
            >
              <Building2 size={17} />
              유관기관 담당자
            </button>
          </div>
          <form onSubmit={submit}>
            <Field
              label="아이디"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                role === "admin"
                  ? "관리자 아이디를 입력해 주세요"
                  : "기관 담당자 아이디를 입력해 주세요"
              }
              required
            />
            <Field label="비밀번호">
              <div className="password-input">
                <input
                  autoComplete="current-password"
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해 주세요"
                  required
                />
                <button
                  type="button"
                  className="icon"
                  aria-label="비밀번호 표시 전환"
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            <button className="primary login-submit" disabled={busy}>
              {busy ? "확인 중…" : "로그인"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="login-help">
            <LockKeyhole size={15} />
            계정 발급 및 비밀번호 재설정은 관리자에게 문의해 주세요.
          </p>
          {DEMO && (
            <div className="demo-login">
              <b>가상 데이터로 둘러보기</b>
              <p>
                관리자 <code>사서원 / 1234</code>
                <br />
                기관 담당자 <code>연계기관 / demo1234!</code>
              </p>
              <span>
                체험 데이터는 이 브라우저에만 저장됩니다.
                <br />
                실제 개인정보를 입력하지 마세요.
              </span>
            </div>
          )}
        </section>
      </main>
      <footer className="login-footer">
        <span>함께 연결하고, 함께 돌봅니다.</span>
        <span>통합접수 · 맞춤 지원 · 지역사회 연계</span>
      </footer>
    </div>
  );
}

const NAV = [
  ["all", "신청자 전체 명단", Users],
  ["child", "아동·청소년 사업", Sprout],
  ["youth", "청년 사업", BriefcaseBusiness],
  ["detail", "신청자 상세 관리", ContactRound],
  ["meetings", "민관협의체 운영", CalendarDays],
];
function App() {
  const [user, setUser] = useState(null),
    [loaded, setLoaded] = useState(false),
    [data, setData] = useState({
      cases: [],
      agencies: [],
      accounts: [],
      meetings: [],
      sheet: {},
    }),
    [tab, setTab] = useState("all"),
    [toast, setToast] = useState(null),
    [search, setSearch] = useState(""),
    [group, setGroup] = useState("전체"),
    [status, setStatus] = useState("전체"),
    [program, setProgram] = useState("전체"),
    [selected, setSelected] = useState(null),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false),
    [page, setPage] = useState(1);
  function notify(message, type = "success") {
    setToast({ message, type });
  }
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    call("me")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  async function refresh() {
    setBusy(true);
    try {
      setData(await call("state"));
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (user && !user.mustChangePassword) refresh();
  }, [user]);
  useEffect(() => {
    setPage(1);
  }, [tab, search, group, status, program]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, user?.id]);
  async function mutate(action, payload, close = true) {
    setBusy(true);
    try {
      const r = await call(action, payload);
      if (action === "password") {
        setUser(r.user);
        setModal(null);
      } else {
        await refresh();
        if (close) setModal(null);
      }
      notify("저장했습니다.");
      return true;
    } catch (e) {
      notify(e.message, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await call("logout", {});
    } catch {}
    setUser(null);
    setData({ cases: [], agencies: [], accounts: [], meetings: [], sheet: {} });
    setSelected(null);
    setTab("all");
    setModal(null);
  }
  const admin = user?.role === "admin",
    cases = data.cases,
    active = cases.filter((c) =>
      c.services.some((s) => s.status === "진행 중"),
    ).length,
    waiting = cases.filter((c) =>
      c.services.some((s) => s.status === "연계 대기"),
    ).length,
    completed = cases.filter((c) =>
      c.services.every((s) => s.status === "완료"),
    ).length;
  const current = cases.find((c) => c.id === selected);
  const currentNav = NAV.find((n) => n[0] === tab);
  const filtered = cases.filter(
    (c) =>
      (tab !== "child" || c.group === "아동청소년") &&
      (tab !== "youth" || c.group === "청년") &&
      (group === "전체" || c.group === group) &&
      (!search || [c.birth, c.reference].some((v) => v.includes(search))) &&
      matchesServices(c, program, status),
  );
  const openCase = (id) => {
    setSelected(id);
    setTab("detail");
    setSearch("");
  };
  if (!loaded)
    return <div className="loading">통합접수창구를 준비하고 있습니다…</div>;
  return (
    <>
      <div
        className={"toast " + (toast?.type === "error" ? "error" : "")}
        role="status"
        style={{ display: toast ? "flex" : "none" }}
      >
        {toast?.type === "error" ? (
          <AlertCircle size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}{" "}
        {toast?.message}
      </div>
      {!user ? (
        <Login onLogin={setUser} notify={notify} />
      ) : (
        <div className="app-shell">
          <aside className={"sidebar " + (mobile ? "open" : "")}>
            <a
              className="brand"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setTab("all");
              }}
            >
              <Mark small />
              <span>
                선을 넘어, 함께<small>통합접수창구</small>
              </span>
            </a>
            <div className="workspace-label">
              WORKSPACE <span>관리시스템</span>
            </div>
            <nav>
              {NAV.filter((n) => admin || n[0] !== "meetings").map(
                ([id, label, Icon]) => (
                  <button
                    key={id}
                    className={tab === id ? "active" : ""}
                    onClick={() => {
                      setTab(id);
                      setSearch("");
                      setGroup("전체");
                      setStatus("전체");
                      setProgram("전체");
                      setMobile(false);
                    }}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                    {id === "all" && <b>{cases.length}</b>}
                    {id === "meetings" && <LockKeyhole size={12} />}
                  </button>
                ),
              )}
            </nav>
            <div className="sidebar-bottom">
              {admin && (
                <button
                  className={tab === "settings" ? "active" : ""}
                  onClick={() => setTab("settings")}
                >
                  <Settings size={19} /> 계정 및 연동 관리
                </button>
              )}
              <div className="sidebar-card">
                <span className="tiny-icon">
                  <HeartHandshake size={23} />
                </span>
                <b>연결의 시작은 작은 관심에서</b>
                <p>
                  서로의 속도를 존중하며
                  <br />
                  가능성을 함께 이어갑니다.
                </p>
              </div>
              <div className="privacy-mini">
                <ShieldCheck size={14} /> 개인정보 보호 모드
              </div>
            </div>
          </aside>
          <div className="app-main">
            <header className="topbar">
              <div>
                <button
                  className="icon mobile-menu"
                  onClick={() => setMobile(!mobile)}
                  aria-label="메뉴"
                >
                  <Menu size={22} />
                </button>
                <span>통합접수창구</span>
                <ChevronRight size={14} />
                <b>{currentNav?.[1] || "계정 및 연동 관리"}</b>
              </div>
              <div>
                <span className={"connection " + (DEMO ? "demo" : "")}>
                  <i />
                  {DEMO ? "가상 데이터 체험" : "실운영 모드"}
                </span>
                <span className="topbar-divider" />
                <span className="avatar">{admin ? "사" : "기"}</span>
                <button
                  className="user-button"
                  onClick={() => setModal({ type: "password" })}
                >
                  {user.displayName}
                  <small>{admin ? "시스템 관리자" : "기관 담당자"}</small>
                </button>
                <button className="icon" aria-label="로그아웃" onClick={logout}>
                  <LogOut size={18} />
                </button>
              </div>
            </header>
            <main className="content">
              {user.mustChangePassword ? (
                <div className="empty">
                  <KeyRound size={36} />
                  <h2>초기 비밀번호를 변경해 주세요.</h2>
                  <p>새 비밀번호를 설정하면 관리 화면을 이용할 수 있습니다.</p>
                  <button
                    className="primary"
                    onClick={() => setModal({ type: "password" })}
                  >
                    비밀번호 변경
                  </button>
                </div>
              ) : (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="section-kicker">
                        {tab === "all"
                          ? "INTAKE OVERVIEW"
                          : tab === "child"
                            ? "CHILDREN & YOUTH"
                            : tab === "youth"
                              ? "YOUNG ADULTS"
                              : tab === "meetings"
                                ? "TOGETHER COUNCIL"
                                : tab === "settings"
                                  ? "WORKSPACE SETTINGS"
                                  : "PERSONAL SUPPORT"}
                      </div>
                      <h1>
                        {currentNav?.[1] || "계정 및 연동 관리"}
                        <span className="heading-dot" />
                      </h1>
                      <p>
                        {tab === "all"
                          ? "한 사람의 접수부터 서비스 연결까지, 지원 현황을 한눈에 확인하세요."
                          : tab === "child"
                            ? "아동·청소년의 성장을 돕는 프로그램과 지원 단계를 관리하세요."
                            : tab === "youth"
                              ? "상담부터 자립과 일경험, 사후관리까지 연결하세요."
                              : tab === "detail"
                                ? "신청자의 지원 여정과 기관의 의견을 함께 살펴보세요."
                                : tab === "meetings"
                                  ? "당사자와 기관의 목소리를 모아, 더 나은 지원을 함께 만듭니다."
                                  : "담당자 계정과 기관을 관리하고 구글 시트를 연결하세요."}
                      </p>
                    </div>
                    <div className="heading-actions">
                      {tab === "meetings" ? (
                        <button
                          className="primary"
                          onClick={() => setModal({ type: "meeting" })}
                        >
                          <Plus size={17} /> 회의 등록
                        </button>
                      ) : (
                        <button
                          className="secondary"
                          onClick={refresh}
                          disabled={busy}
                        >
                          <RefreshCw size={16} className={busy ? "spin" : ""} />
                          새로고침
                        </button>
                      )}
                    </div>
                  </div>
                  {DEMO && (
                    <div className="demo-strip">
                      <span>
                        <span className="demo-dot" />
                        가상 데이터 체험 모드
                      </span>
                      <p>
                        화면의 모든 대상자·검사점수·기관은 예시입니다. 실제
                        개인정보를 입력하지 마세요.
                      </p>
                    </div>
                  )}
                  {["all", "child", "youth"].includes(tab) && (
                    <>
                      <div className="stats">
                        <Stat
                          title="전체 신청자"
                          value={cases.length}
                          unit="명"
                          label="함께 연결할 소중한 일상"
                          icon={Users}
                          color="purple"
                        />
                        <Stat
                          title="서비스 진행 중"
                          value={active}
                          unit="명"
                          label="맞춤형 지원을 이어가고 있어요"
                          icon={HeartHandshake}
                          color="teal"
                        />
                        <Stat
                          title="연계 대기"
                          value={waiting}
                          unit="명"
                          label="다음 연결을 기다리고 있어요"
                          icon={Clock}
                          color="yellow"
                        />
                        <Stat
                          title="지원 완료"
                          value={completed}
                          unit="명"
                          label="모든 신청 서비스 완료"
                          icon={CheckCircle2}
                          color="blue"
                        />
                      </div>
                      {tab !== "all" && (
                        <div className="program-overview">
                          {(tab === "child" ? CHILD : YOUTH).map((p, i) => (
                            <button
                              key={p}
                              className={program === p ? "selected" : ""}
                              onClick={() =>
                                setProgram(program === p ? "전체" : p)
                              }
                            >
                              <span className="program-number">0{i + 1}</span>
                              <b>{p}</b>
                              <span>
                                {
                                  cases.filter((c) =>
                                    c.services.some((s) => s.program === p),
                                  ).length
                                }
                                <small>명</small>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      <section className="panel applicants-panel">
                        <div className="panel-heading">
                          <div>
                            <h2>
                              {tab === "all"
                                ? "전체 신청자"
                                : tab === "child"
                                  ? "아동·청소년 신청자"
                                  : "청년 신청자"}{" "}
                              <span>{filtered.length}</span>
                            </h2>
                            <p>
                              대상자 번호를 선택하면 상세한 지원 이력을 볼 수
                              있습니다.
                            </p>
                          </div>
                          <span className="privacy-tag">
                            <ShieldCheck size={14} />
                            이름 비공개
                          </span>
                        </div>
                        <div className="filters">
                          <div className="search-input">
                            <Search size={18} />
                            <input
                              aria-label="대상자 검색"
                              placeholder="생년월일 6자리 또는 접수번호 검색"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                              <button
                                className="icon"
                                onClick={() => setSearch("")}
                                aria-label="검색 초기화"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          {tab === "all" && (
                            <select
                              aria-label="대상 구분"
                              value={group}
                              onChange={(e) => setGroup(e.target.value)}
                            >
                              <option value="전체">전체 대상</option>
                              <option>아동청소년</option>
                              <option>청년</option>
                            </select>
                          )}
                          <select
                            aria-label="진행 상태"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="전체">전체 진행 상태</option>
                            {STATUS.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            className="filter-reset"
                            onClick={() => {
                              setSearch("");
                              setStatus("전체");
                              setGroup("전체");
                              setProgram("전체");
                            }}
                          >
                            <SlidersHorizontal size={16} />
                            초기화
                          </button>
                        </div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>대상자 / 접수번호</th>
                                <th>구분 · 연령</th>
                                <th>선별검사</th>
                                <th>신청 프로그램</th>
                                <th>진행 상태</th>
                                <th>접수일</th>
                                <th />
                              </tr>
                            </thead>
                            <tbody>
                              {filtered
                                .slice((page - 1) * 8, page * 8)
                                .map((c) => (
                                  <tr key={c.id} onClick={() => openCase(c.id)}>
                                    <td>
                                      <button
                                        className="case-id"
                                        onClick={() => openCase(c.id)}
                                      >
                                        {c.birth}
                                      </button>
                                      <small>{c.reference}</small>
                                    </td>
                                    <td>
                                      <span
                                        className={
                                          "group-label " +
                                          (c.group === "청년"
                                            ? "youth"
                                            : "child")
                                        }
                                      >
                                        {c.group === "아동청소년"
                                          ? "아동·청소년"
                                          : "청년"}
                                      </span>
                                      <small>만 {c.age}세</small>
                                    </td>
                                    <td>
                                      {c.score === null ? (
                                        <span className="muted">미입력</span>
                                      ) : (
                                        <>
                                          <strong className="score">
                                            {c.score}
                                          </strong>
                                          <span className="muted"> 점</span>
                                        </>
                                      )}
                                    </td>
                                    <td>
                                      {c.services
                                        .filter(
                                          (s) =>
                                            program === "전체" ||
                                            s.program === program,
                                        )
                                        .map((s) => (
                                          <div
                                            className="program-title table-program"
                                            key={s.id}
                                          >
                                            {s.program}
                                          </div>
                                        ))}
                                    </td>
                                    <td>
                                      {c.services
                                        .filter(
                                          (s) =>
                                            program === "전체" ||
                                            s.program === program,
                                        )
                                        .map((s) => (
                                          <div
                                            className="table-program"
                                            key={s.id}
                                          >
                                            <Badge value={s.status} />
                                          </div>
                                        ))}
                                    </td>
                                    <td className="date-cell">
                                      {formatDate(c.receivedAt)}
                                    </td>
                                    <td>
                                      <ArrowUpRight size={16} />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {!filtered.length && (
                            <div className="empty">
                              <Search size={30} />
                              <h3>해당하는 신청자가 없습니다.</h3>
                              <p>검색어나 필터를 변경해 보세요.</p>
                            </div>
                          )}
                        </div>
                        <div className="table-footer">
                          <span>
                            총 <b>{filtered.length}</b>명 중{" "}
                            {filtered.length ? (page - 1) * 8 + 1 : 0}–
                            {Math.min(page * 8, filtered.length)}명 표시
                          </span>
                          <div className="pagination">
                            <button
                              aria-label="이전 페이지"
                              disabled={page === 1}
                              onClick={() => setPage(page - 1)}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            {Array.from(
                              { length: Math.ceil(filtered.length / 8) },
                              (_, i) => (
                                <button
                                  key={i}
                                  className={page === i + 1 ? "active" : ""}
                                  onClick={() => setPage(i + 1)}
                                >
                                  {i + 1}
                                </button>
                              ),
                            )}
                            <button
                              aria-label="다음 페이지"
                              disabled={page >= Math.ceil(filtered.length / 8)}
                              onClick={() => setPage(page + 1)}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </section>
                      <div className="bottom-note">
                        <ShieldCheck size={15} />
                        <span>
                          개인정보 보호를 위해 생년월일 6자리와 접수번호로
                          표시합니다. 검사점수는 접수 기록이며 자동 진단에
                          사용하지 않습니다.
                        </span>
                      </div>
                    </>
                  )}
                  {tab === "detail" && (
                    <div className="detail-layout">
                      <section className="panel case-picker">
                        <div className="panel-heading">
                          <h2>
                            대상자 선택 <span>{cases.length}</span>
                          </h2>
                        </div>
                        <div className="search-input">
                          <Search size={16} />
                          <input
                            placeholder="생년월일 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>
                        <div className="picker-list">
                          {cases
                            .filter(
                              (c) =>
                                !search ||
                                c.birth.includes(search) ||
                                c.reference.includes(search),
                            )
                            .map((c) => (
                              <button
                                key={c.id}
                                className={selected === c.id ? "active" : ""}
                                onClick={() => setSelected(c.id)}
                              >
                                <div>
                                  <b>{c.birth}</b>
                                  <small>{c.reference}</small>
                                </div>
                                <span>
                                  {c.group === "청년" ? "청년" : "아동·청소년"}
                                </span>
                              </button>
                            ))}
                        </div>
                      </section>
                      {current ? (
                        <CaseDetail
                          record={current}
                          data={data}
                          admin={admin}
                          user={user}
                          notify={notify}
                          setModal={setModal}
                        />
                      ) : (
                        <section className="panel empty">
                          <ContactRound size={38} />
                          <h2>함께할 대상자를 선택해 주세요.</h2>
                          <p>
                            지원 현황과 프로그램별 의견을 확인할 수 있습니다.
                          </p>
                        </section>
                      )}
                    </div>
                  )}
                  {tab === "meetings" && admin && (
                    <div className="meetings-grid">
                      {data.meetings
                        .slice()
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((m) => (
                          <article className="panel meeting-card" key={m.id}>
                            <div className="meeting-top">
                              <span
                                className={
                                  "meeting-status " +
                                  (m.status === "완료" ? "done" : "")
                                }
                              >
                                {m.status}
                              </span>
                              <span className="privacy-tag">
                                <LockKeyhole size={12} />
                                관리자 전용
                              </span>
                            </div>
                            <div className="meeting-date">
                              <span>
                                {new Date(m.date).toLocaleDateString("ko-KR", {
                                  month: "long",
                                })}
                              </span>
                              <b>{new Date(m.date).getDate()}</b>
                            </div>
                            <h2>{m.title}</h2>
                            <p>
                              <Clock size={15} />
                              {formatTime(m.date)}
                            </p>
                            <p>
                              <Building2 size={15} />
                              {m.place || "장소 미정"}
                            </p>
                            <div className="meeting-agenda">
                              <h3>주요 안건</h3>
                              <p>{m.agenda || "등록된 안건이 없습니다."}</p>
                            </div>
                            <button
                              className="secondary"
                              onClick={() =>
                                setModal({ type: "meeting", value: m })
                              }
                            >
                              안건 및 회의록 관리
                              <ArrowRight size={15} />
                            </button>
                          </article>
                        ))}
                      {!data.meetings.length && (
                        <div className="panel empty">
                          <CalendarDays size={32} />
                          <h2>등록된 회의가 없습니다.</h2>
                          <p>첫 민관협의체 회의를 등록해 보세요.</p>
                        </div>
                      )}
                    </div>
                  )}
                  {tab === "settings" && admin && (
                    <SettingsPage
                      data={data}
                      setModal={setModal}
                      mutate={mutate}
                      notify={notify}
                      busy={busy}
                    />
                  )}
                </>
              )}
            </main>
            <footer className="app-footer">
              <span>
                선을 넘어, 함께 <i /> 경계선지능인 지원사업
              </span>
              <span>서로의 속도로, 함께 걷는 내일.</span>
            </footer>
          </div>
        </div>
      )}
      {modal && (
        <Modal
          title={
            {
              password: "비밀번호 변경",
              service: "서비스 연계 관리",
              note: "프로그램 의견 작성",
              caution: "지원 시 참고사항",
              meeting: modal.value
                ? "회의 및 회의록 관리"
                : "민관협의체 회의 등록",
              account: "담당자 계정 발급",
              accountReset: "임시 비밀번호 재발급",
              agency: "연계기관 등록",
            }[modal.type] || "상세정보"
          }
          onClose={() => {
            if (!user?.mustChangePassword) setModal(null);
          }}
          wide={modal.type === "meeting"}
        >
          <Editor
            key={modal.type + (modal.value?.id || "")}
            modal={modal}
            current={current}
            data={data}
            user={user}
            busy={busy}
            mutate={mutate}
          />
        </Modal>
      )}
    </>
  );
}
function Stat({ title, value, unit, label, icon: Icon, color }) {
  return (
    <div className="stat">
      <div>
        <span className="stat-title">{title}</span>
        <div className="stat-value">
          {value}
          <small>{unit}</small>
        </div>
        <p>{label}</p>
      </div>
      <span className={"stat-icon " + color}>
        <Icon size={23} />
      </span>
    </div>
  );
}
function CaseDetail({ record: c, data, admin, user, notify, setModal }) {
  const [privateInfo, setPrivateInfo] = useState(null);
  useEffect(() => {
    setPrivateInfo(null);
  }, [c.id]);
  async function reveal() {
    try {
      setPrivateInfo(await call("private", { id: c.id }));
      setTimeout(() => setPrivateInfo(null), 30000);
    } catch (e) {
      notify(e.message, "error");
    }
  }
  return (
    <div className="case-content">
      <section className="panel detail-summary">
        <div className="detail-summary-top">
          <div>
            <span
              className={
                "group-label " + (c.group === "청년" ? "youth" : "child")
              }
            >
              {c.group}
            </span>
            <h2>
              {c.birth} <span>만 {c.age}세</span>
            </h2>
            <p>
              {c.reference} <i /> 접수일 {formatDate(c.receivedAt)}
            </p>
          </div>
          <span className="detail-avatar">
            <Sprout size={34} />
          </span>
        </div>
        <div className="detail-facts">
          <div>
            <span>선별검사 점수</span>
            <b>
              {c.score ?? "미입력"}
              {c.score !== null && <small>점</small>}
            </b>
          </div>
          <div>
            <span>신청 프로그램</span>
            <b>
              {c.services.length}
              <small>개</small>
            </b>
          </div>
          <div>
            <span>연계 기관</span>
            <b>
              {c.agencyIds.length}
              <small>곳</small>
            </b>
          </div>
        </div>
        <div className="request-box">
          <h3>
            <MessageSquare size={16} />
            신청자의 당부말씀
          </h3>
          <p>{c.request || "입력된 내용이 없습니다."}</p>
        </div>
        {admin && (
          <div className="private-reveal">
            <button
              className="text-button"
              onClick={privateInfo ? () => setPrivateInfo(null) : reveal}
            >
              {privateInfo ? <EyeOff size={15} /> : <Eye size={15} />} 관리자
              이름 확인
            </button>
            {privateInfo && (
              <span>
                {privateInfo.name || "이름 미입력"}{" "}
                <small>30초 후 숨김 · 열람 이력 기록</small>
              </span>
            )}
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>프로그램별 지원 현황</h2>
            <p>연계 기관과 프로그램 진행 단계를 확인하세요.</p>
          </div>
        </div>
        <div className="services-list">
          {c.services.map((s) => (
            <div className="service-row" key={s.id}>
              <span className="service-icon">
                <Link size={19} />
              </span>
              <div>
                <h3>{s.program}</h3>
                <p>
                  {data.agencies.find((a) => a.id === s.agencyId)?.name ||
                    "연계기관 미배정"}
                  {s.startDate &&
                    " · " + s.startDate + " ~ " + (s.endDate || "진행 중")}
                </p>
              </div>
              <Badge value={s.status} />
              {admin && (
                <button
                  className="secondary small-button"
                  onClick={() => setModal({ type: "service", value: s })}
                >
                  연계 관리
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="panel caution-panel">
        <div className="panel-heading">
          <h2>
            <AlertCircle size={18} />
            지원 시 참고사항
          </h2>
          {admin && (
            <button
              className="text-button"
              onClick={() => setModal({ type: "caution" })}
            >
              수정
            </button>
          )}
        </div>
        <p>{c.cautions || "아직 작성된 참고사항이 없습니다."}</p>
        <small>
          관찰한 상황과 도움이 된 지원 방법을 구체적으로 기록해 주세요.
        </small>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              함께 쌓아가는 지원 기록 <span>{c.notes.length}</span>
            </h2>
            <p>프로그램 참여 이력과 기관 담당자의 의견입니다.</p>
          </div>
          {(admin || c.services.some((s) => s.agencyId === user.agencyId)) && (
            <button
              className="primary small-button"
              onClick={() => setModal({ type: "note" })}
            >
              <Plus size={15} />
              의견 작성
            </button>
          )}
        </div>
        <div className="timeline">
          {c.notes
            .slice()
            .reverse()
            .map((n) => (
              <article key={n.id}>
                <span
                  className={"timeline-dot " + (n.system ? "system" : "")}
                />
                <div className="timeline-header">
                  <b>{n.system ? "진행 이력" : n.program}</b>
                  <time>{formatTime(n.at)}</time>
                </div>
                <p>{n.content}</p>
                <small>
                  {n.author}
                  {n.agencyId &&
                    " · " +
                      (data.agencies.find((a) => a.id === n.agencyId)?.name ||
                        "사서원")}
                </small>
              </article>
            ))}
          <article>
            <span className="timeline-dot system" />
            <div className="timeline-header">
              <b>통합접수창구 신청</b>
              <time>{formatDate(c.receivedAt)}</time>
            </div>
            <p>맞춤형 서비스 지원 여정이 시작되었습니다.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

function Editor({ modal: m, current: c, data, user, busy, mutate }) {
  const defaults =
    m.type === "accountReset"
      ? { id: m.value.id, password: "" }
      : m.type === "service"
        ? { ...m.value }
        : m.type === "caution"
          ? { content: c?.cautions || "" }
          : m.type === "meeting"
            ? {
                title: "",
                date: "",
                place: "",
                agenda: "",
                minutes: "",
                status: "예정",
                ...m.value,
              }
            : m.type === "account"
              ? {
                  username: "",
                  password: "",
                  displayName: "",
                  role: "agency",
                  agencyId: data.agencies[0]?.id || "",
                }
              : m.type === "agency"
                ? { name: "", type: "" }
                : m.type === "note"
                  ? {
                      content: "",
                      serviceId:
                        c?.services.find(
                          (s) =>
                            user.role === "admin" ||
                            s.agencyId === user.agencyId,
                        )?.id || "",
                    }
                  : { current: "", next: "" };
  const [form, setForm] = useState(defaults);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const field = (key, label, type = "text", required = false) => (
    <Field
      label={label}
      value={form[key] || ""}
      type={type}
      required={required}
      onChange={set(key)}
    />
  );
  const textarea = (key, label, required = false) => (
    <Field label={label}>
      <textarea
        value={form[key] || ""}
        onChange={set(key)}
        required={required}
        rows={key === "minutes" ? 7 : 4}
        maxLength={key === "minutes" ? 8000 : 4000}
      />
    </Field>
  );
  async function submit(e) {
    e.preventDefault();
    await mutate(m.type, {
      ...form,
      ...(["service", "caution", "note"].includes(m.type) ? { id: c.id } : {}),
      ...(m.type === "service" ? { serviceId: m.value.id } : {}),
    });
  }
  return (
    <form className="editor" onSubmit={submit}>
      {m.type === "accountReset" && (
        <>
          <div className="editor-context">
            {m.value.username} · {m.value.displayName}
          </div>
          {field(
            "password",
            "새 임시 비밀번호 (10자리 이상)",
            "password",
            true,
          )}
          <p className="editor-hint">
            기존 로그인 세션은 종료되며 다음 로그인 후 비밀번호를 다시 변경해야
            합니다.
          </p>
        </>
      )}
      {m.type === "password" && (
        <>
          <p className="editor-hint">
            10자리 이상의 새 비밀번호를 설정해 주세요.
          </p>
          {field("current", "현재 비밀번호", "password", true)}
          {field("next", "새 비밀번호", "password", true)}
        </>
      )}
      {m.type === "service" && (
        <>
          <div className="editor-context">
            {c.birth} <ChevronRight size={14} />
            {m.value.program}
          </div>
          <Field label="진행 상태">
            <select value={form.status} onChange={set("status")}>
              {STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="연계 기관">
            <select value={form.agencyId || ""} onChange={set("agencyId")}>
              <option value="">미배정</option>
              {data.agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="two-fields">
            {field("startDate", "참여 시작일", "date")}
            {field("endDate", "참여 종료일", "date")}
          </div>
          <p className="editor-hint">
            기관을 배정하면 해당 기관 담당자가 이 대상자를 조회하고 담당
            프로그램에 의견을 남길 수 있습니다.
          </p>
        </>
      )}
      {m.type === "note" && (
        <>
          <Field label="참여 프로그램">
            <select value={form.serviceId} onChange={set("serviceId")} required>
              {c.services
                .filter(
                  (s) => user.role === "admin" || s.agencyId === user.agencyId,
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.program}
                  </option>
                ))}
            </select>
          </Field>
          {textarea("content", "기관 의견 및 참여 내용", true)}
          <p className="editor-hint">
            대상자의 이름·연락처를 기재하지 말고, 관찰 사실과 지원 방법을 작성해
            주세요. 기록은 배정 기관과 관리자가 함께 확인합니다.
          </p>
        </>
      )}
      {m.type === "caution" && (
        <>
          {textarea("content", "지원 시 참고사항")}
          <p className="editor-hint">
            예: 긴 활동 전 짧은 휴식 시간을 안내하면 참여에 도움이 됩니다.
          </p>
        </>
      )}
      {m.type === "meeting" && (
        <>
          {field("title", "회의명", "text", true)}
          <div className="two-fields">
            {field("date", "회의 일시 (한국시간)", "datetime-local", true)}
            {field("place", "회의 장소")}
          </div>
          {textarea("agenda", "회의 안건")}
          {textarea("minutes", "회의록 및 개선방안")}
          <Field label="운영 상태">
            <select value={form.status} onChange={set("status")}>
              <option>예정</option>
              <option>완료</option>
            </select>
          </Field>
        </>
      )}
      {m.type === "agency" && (
        <>
          {field("name", "기관명", "text", true)}
          {field("type", "기관 유형 (예: 심리상담, 일경험)")}
        </>
      )}
      {m.type === "account" && (
        <>
          {field("username", "아이디", "text", true)}
          {field("displayName", "담당자 표시명", "text", true)}
          {field("password", "임시 비밀번호 (10자리 이상)", "password", true)}
          <Field label="계정 권한">
            <select value={form.role} onChange={set("role")}>
              <option value="agency">유관기관 담당자</option>
              <option value="admin">사서원 관리자</option>
            </select>
          </Field>
          {form.role === "agency" && (
            <Field label="소속 기관">
              <select value={form.agencyId} onChange={set("agencyId")} required>
                <option value="">기관 선택</option>
                {data.agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <p className="editor-hint">
            발급된 계정은 첫 로그인 후 비밀번호를 변경해야 합니다.
          </p>
        </>
      )}
      <div className="editor-footer">
        <button className="primary" disabled={busy}>
          <Check size={17} />
          {busy ? "저장 중…" : "저장하기"}
        </button>
      </div>
    </form>
  );
}
function SettingsPage({ data, setModal, mutate, notify, busy }) {
  const [headers, setHeaders] = useState([]),
    [mapping, setMapping] = useState(data.sheet?.mapping || {}),
    [result, setResult] = useState(null),
    [loading, setLoading] = useState(false);
  async function operation(action, payload) {
    setLoading(true);
    try {
      const r = await call(action, payload);
      if (action === "sheetHeaders") setHeaders(r.headers);
      if (action === "sheetPreview") setResult(r);
      if (action === "sheetMapping") notify("열 연결을 저장했습니다.");
      if (action === "sheetSync")
        notify(`동기화 완료: 신규 ${r.created}건, 갱신 ${r.updated}건`);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  }
  const mapLabels = {
    sourceId: "접수ID (고유값) *",
    birth: "생년월일 *",
    group: "대상구분 *",
    programs: "신청 프로그램 *",
    name: "신청자 이름 (관리자 전용)",
    score: "선별검사 점수",
    request: "당부말씀",
    receivedAt: "접수 일시",
  };
  return (
    <div className="settings-stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>담당자 계정</h2>
            <p>계정 발급과 이용 권한은 관리자만 관리할 수 있습니다.</p>
          </div>
          <button
            className="primary small-button"
            onClick={() => setModal({ type: "account" })}
          >
            <Plus size={15} />
            계정 발급
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>아이디</th>
                <th>표시명</th>
                <th>권한 · 소속</th>
                <th>이용 상태</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.username}</b>
                  </td>
                  <td>{a.displayName}</td>
                  <td>
                    {a.role === "admin"
                      ? "사서원 관리자"
                      : data.agencies.find((v) => v.id === a.agencyId)?.name ||
                        "기관 담당자"}
                  </td>
                  <td>
                    <span
                      className={"account-active " + (!a.active ? "off" : "")}
                    >
                      {a.active ? "사용 중" : "이용 중지"}
                    </span>
                  </td>
                  <td>
                    <div className="account-actions">
                      <button
                        className="secondary small-button"
                        onClick={() =>
                          setModal({ type: "accountReset", value: a })
                        }
                      >
                        비밀번호 재발급
                      </button>
                      <button
                        className="secondary small-button"
                        disabled={busy}
                        onClick={() =>
                          mutate("accountToggle", { id: a.id }, false)
                        }
                      >
                        {a.active ? "이용 중지" : "이용 재개"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              서비스 연계기관 <span>{data.agencies.length}</span>
            </h2>
            <p>대상자를 연계할 기관을 등록하세요.</p>
          </div>
          <button
            className="secondary small-button"
            onClick={() => setModal({ type: "agency" })}
          >
            <Plus size={15} />
            기관 등록
          </button>
        </div>
        <div className="agency-grid">
          {data.agencies.map((a) => (
            <div key={a.id}>
              <Building2 size={21} />
              <span>
                <b>{a.name}</b>
                <small>{a.type || "유관기관"}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>
              <span className="sheet-symbol">▤</span>구글 스프레드시트 연결
            </h2>
            <p>
              구글 폼 응답을 가져오고, 앱에서 작성한 지원 기록은 보존합니다.
            </p>
          </div>
          <span className="privacy-tag">
            {DEMO ? "연결 전 · 체험 모드" : "서버 연결 방식"}
          </span>
        </div>
        <div className="sheet-content">
          <div className="sheet-flow">
            <span>
              <FileText size={19} />
              구글 폼
            </span>
            <ChevronRight size={18} />
            <span>
              <ClipboardList size={19} />
              응답 시트
            </span>
            <ChevronRight size={18} />
            <span>
              <Mark small />
              통합접수창구
            </span>
          </div>
          <p>
            지정 시트 ID:{" "}
            <code>1FQKxt_L0JjBN5gPAw76s78FcTvjeuMo9bbNnhpfD3-Q</code>
          </p>
          <p className="editor-hint">
            시트의 실제 열 제목을 연결합니다. 접수ID는 중복 없는 고정값이어야
            합니다. 이름은 별도 관리자 전용 영역에 저장하며, 이름·연락처 등 다른
            열은 자동으로 가져오지 않습니다. 처음 연결하기 전 접수ID 자동 발급
            스크립트를 설치해 주세요.
          </p>
          <button
            className="secondary"
            disabled={loading}
            onClick={() => operation("sheetHeaders")}
          >
            <RefreshCw size={16} />
            시트 열 불러오기
          </button>
          <div className="mapping-grid">
            {Object.entries(mapLabels).map(([key, label]) => (
              <Field key={key} label={label}>
                <select
                  value={mapping[key] || ""}
                  onChange={(e) => {
                    setMapping({ ...mapping, [key]: e.target.value });
                    setResult(null);
                  }}
                >
                  <option value="">연결할 열 선택</option>
                  {[...new Set([...headers, ...Object.values(mapping)])]
                    .filter(Boolean)
                    .map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                </select>
              </Field>
            ))}
          </div>
          <div className="sheet-actions">
            <button
              className="secondary"
              disabled={loading}
              onClick={() => operation("sheetPreview", { mapping })}
            >
              가져오기 미리보기
            </button>
            <button
              className="secondary"
              disabled={loading || !result || result.errors.length > 0}
              onClick={() => operation("sheetMapping", { mapping })}
            >
              열 연결 저장
            </button>
            <button
              className="primary"
              disabled={loading}
              onClick={() => operation("sheetSync", {})}
            >
              <RefreshCw size={16} />
              {loading ? "처리 중…" : "지금 동기화"}
            </button>
          </div>
          {result && (
            <div className="import-result">
              <b>
                유효 {result.valid}건 · 오류 {result.errors.length}건
              </b>
              {result.errors.map((e) => (
                <p key={e.row}>
                  {e.row}행: {e.message}
                </p>
              ))}
              {result.sample?.map((r, i) => (
                <p key={i}>
                  {r.birth} · {r.group} · {r.programs.join(", ")}
                </p>
              ))}
            </div>
          )}
          <small className="muted">
            최근 동기화: {formatTime(data.sheet?.lastSyncedAt)} · 자동 동기화는
            Apps Script 제출 트리거 설정 후 동작합니다.
          </small>
        </div>
      </section>
    </div>
  );
}
export default App;
