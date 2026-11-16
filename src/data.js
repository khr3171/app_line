export const CHILD = [
  "진단검사 지원",
  "부모상담 및 치료프로그램",
  "방학단기프로그램",
  "바우처 지원 연계",
  "유소년 축구교실",
];
export const YOUTH = [
  "상담",
  "사례관리 계획",
  "자립교육",
  "일경험처 연계",
  "사후관리",
];
export const STATUS = [
  "접수",
  "검토 중",
  "연계 대기",
  "진행 중",
  "완료",
  "보류",
];
export function matchesServices(record, program, status) {
  return record.services.some(
    (s) =>
      (program === "전체" || s.program === program) &&
      (status === "전체" || s.status === status),
  );
}
function parseDate(v) {
  if (!v) return null;
  let s = String(v).trim();
  if (s.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/.test(s)) s += "+09:00";
  const korean =
    !s.includes("T") &&
    s.match(
      /^(\d{4})[.\-/]\s*(\d{1,2})[.\-/]\s*(\d{1,2})\.?\s*(오전|오후)?\s*(\d{1,2})?[:시]?(\d{1,2})?[:분]?(\d{1,2})?/,
    );
  if (korean) {
    let hour = Number(korean[5] || 0);
    if (korean[4]) hour = (hour % 12) + (korean[4] === "오후" ? 12 : 0);
    s = `${korean[1]}-${korean[2].padStart(2, "0")}-${korean[3].padStart(2, "0")}T${String(hour).padStart(2, "0")}:${(korean[6] || "0").padStart(2, "0")}:${(korean[7] || "0").padStart(2, "0")}+09:00`;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
export const formatDate = (v) =>
  parseDate(v)?.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }) || (v ? String(v).slice(0, 30) : "—");
export const formatTime = (v) =>
  parseDate(v)?.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }) ||
  (v ? String(v).slice(0, 50) : "—");
export function makeData() {
  const agencies = [
    { id: "a1", name: "함께봄 심리상담센터", type: "상담·치료" },
    { id: "a2", name: "나란히 청년지원센터", type: "자립·일경험" },
    { id: "a3", name: "초록빛 스포츠클럽", type: "체육·활동" },
  ];
  const births = [
    "120315",
    "010822",
    "140607",
    "990214",
    "100921",
    "030510",
    "150112",
    "020425",
    "110803",
    "000712",
    "130226",
    "040619",
  ];
  const cases = births.map((birth, i) => {
    const group = i % 2 ? "청년" : "아동청소년",
      programs = group === "청년" ? YOUTH : CHILD;
    const p = i % 5;
    return {
      id: "demo-" + i,
      reference: "접수-2026-" + String(101 + i),
      birth,
      age:
        2026 -
        (Number(birth.slice(0, 2)) > 26 ? 1900 : 2000) -
        Number(birth.slice(0, 2)),
      group,
      score: i % 4 === 0 ? null : 65 + (i % 13),
      receivedAt: "2026-11-" + String(2 + i).padStart(2, "0"),
      request: [
        "단계별로 천천히 설명해 주시면 좋겠습니다.",
        "오후 시간대 프로그램 참여를 희망합니다.",
        "새로운 환경에 적응할 시간을 부탁드립니다.",
      ][i % 3],
      cautions:
        i % 3 === 0
          ? "새로운 활동은 시작 전에 순서와 소요 시간을 안내해 주세요."
          : "",
      agencyIds: [i % 2 ? "a2" : "a1"],
      services: [
        {
          id: "s" + i + "a",
          program: programs[p],
          status: STATUS[(i + 3) % 6],
          agencyId: i % 2 ? "a2" : "a1",
          startDate: "2026-11-10",
          endDate: "",
        },
        {
          id: "s" + i + "b",
          program: programs[(p + 1) % 5],
          status: "접수",
          agencyId: "",
          startDate: "",
          endDate: "",
        },
      ],
      notes:
        i % 3 === 0
          ? [
              {
                id: "n" + i,
                program: programs[p],
                serviceId: "s" + i + "a",
                content:
                  "첫 만남에서 활동 순서를 함께 확인했습니다. 다음 회기에는 시각 자료를 활용할 예정입니다.",
                author: "기관 담당자",
                agencyId: i % 2 ? "a2" : "a1",
                at: "2026-11-12T05:30:00Z",
              },
            ]
          : [],
      updatedAt: "2026-11-14T01:00:00Z",
    };
  });
  return {
    cases,
    agencies,
    accounts: [
      {
        id: "admin",
        username: "사서원",
        displayName: "사서원 관리자",
        role: "admin",
        agencyId: "",
        active: true,
      },
      {
        id: "agency",
        username: "연계기관",
        displayName: "함께봄 담당자",
        role: "agency",
        agencyId: "a1",
        active: true,
      },
    ],
    meetings: [
      {
        id: "m1",
        title: "11월 민관협의체 정기회의",
        date: "2026-11-24T14:00",
        place: "사회서비스원 3층 회의실",
        agenda:
          "1. 하반기 서비스 연계 현황 공유\n2. 당사자 의견 수렴 및 프로그램 개선\n3. 기관 간 협력 과제 논의",
        minutes: "",
        status: "예정",
      },
      {
        id: "m2",
        title: "10월 실무자 사례 협의",
        date: "2026-10-28T10:00",
        place: "온라인 회의",
        agenda: "청년 일경험 연계 확대 방안",
        minutes:
          "참여기관별 일경험 가능 직무를 취합하고, 다음 회의에서 공유하기로 했습니다.",
        status: "완료",
      },
    ],
    sheet: { mapping: {}, lastSyncedAt: null },
  };
}
