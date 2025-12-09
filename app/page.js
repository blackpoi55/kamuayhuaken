"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const HazardMap = dynamic(() => import("../components/HazardMap"), {
  ssr: false,
});

/* ========= ข้อมูลระบบจรวดกัมพูชาจริง + โหมด 200 กม. (ข้อมูลเปิดเผย) ========= */

const CAMBODIA_MLRS = [
  {
    id: "type63",
    name: "Type 63 – 107 มม.",
    approxRangeKm: "สูงสุด ~8 กม.",
    role: "จรวดระยะใกล้ ใช้กดดันเป้าหมายติดแนวชายแดน",
  },
  {
    id: "bm14",
    name: "BM-14 – 140 มม.",
    approxRangeKm: "สูงสุด ~10 กม.",
    role: "ระบบรุ่นเก่า ระยะไม่ไกลมาก",
  },
  {
    id: "bm21",
    name: "BM-21 Grad – 122 มม.",
    approxRangeKm: "ประมาณ 20–40 กม.",
    role: "จรวด 40 ท่อที่ถูกพูดถึงบ่อย ครอบคลุมลึกเข้ามาในไทยระดับหนึ่ง",
  },
  {
    id: "type90b",
    name: "PHL-81 / Type 90B – 122 มม.",
    approxRangeKm: "ประมาณ 20–40 กม.",
    role: "รุ่นจีนสมัยใหม่กว่า BM-21 แต่ใช้กระสุนกลุ่มเดียวกัน",
  },
  {
    id: "rm70",
    name: "RM-70 – 122 มม.",
    approxRangeKm: "ประมาณ 20–40 กม.",
    role: "รุ่นยุโรปตะวันออก ใช้กระสุน 122 มม. แบบ Grad",
  },
  {
    id: "phl03",
    name: "PHL-03 – 300 มม.",
    approxRangeKm: "ประมาณ 70–130 กม.",
    role: "จรวดขนาดใหญ่ ระยะไกล ครอบคลุมลึกเข้าไปได้หลายจังหวัด",
  },
];

const WEAPON_PROFILES = [
  {
    id: "close_8km",
    name: "ระยะใกล้ ~8–10 กม.",
    tag: "Type 63 / BM-14",
    summary: "ใช้ดูหมู่บ้าน/ด่านที่ติดชายแดนใกล้มาก",
    maxRangeKm: 10,
    systems: ["type63", "bm14"],
    zones: [
      {
        id: "8_z1",
        label: "0–3 กม. • อันตรายมาก",
        outerRadiusKm: 3,
        color: "#ef4444",
        evacHint: "ต้องอพยพออกจากพื้นที่ทันที",
      },
      {
        id: "8_z2",
        label: "3–6 กม. • สูง",
        outerRadiusKm: 6,
        color: "#f97316",
        evacHint: "รีบเคลื่อนย้ายออกจากพื้นที่เสี่ยง",
      },
      {
        id: "8_z3",
        label: "6–10 กม. • เฝ้าระวัง",
        outerRadiusKm: 10,
        color: "#22c55e",
        evacHint:
          "ใช้เป็นแนวพักอพยพ แต่ยังต้องติดตามสถานการณ์ใกล้ชิด",
      },
    ],
  },
  {
    id: "bm21_family_40km",
    name: "BM-21 family ~40 กม.",
    tag: "BM-21 / PHL-81 / RM-70",
    summary: "กลุ่มจรวด 122 มม. ที่เขมรมีหลายแบบ ใช้ระยะสูงสุด ~40 กม.",
    maxRangeKm: 40,
    systems: ["bm21", "type90b", "rm70"],
    zones: [
      {
        id: "40_z1",
        label: "0–10 กม. • อันตรายมาก",
        outerRadiusKm: 10,
        color: "#b91c1c",
        evacHint:
          "เป็นเขตห้ามอยู่ของพลเรือนหากเกิดการยิงจริง ต้องอพยพทันที",
      },
      {
        id: "40_z2",
        label: "10–20 กม. • สูง",
        outerRadiusKm: 20,
        color: "#f97316",
        evacHint: "ควรอพยพเข้าไปลึกกว่านี้ให้เร็วที่สุด",
      },
      {
        id: "40_z3",
        label: "20–30 กม. • ปานกลาง",
        outerRadiusKm: 30,
        color: "#eab308",
        evacHint:
          "ใช้เป็นโซนพักชั่วคราว แต่ถ้าสถานการณ์รุนแรงควรขยับออกไป",
      },
      {
        id: "40_z4",
        label: "30–40 กม. • ต่ำ",
        outerRadiusKm: 40,
        color: "#22c55e",
        evacHint:
          "ความเสี่ยงลดลงมาก แต่ยังควรฟังประกาศจากรัฐต่อเนื่อง",
      },
    ],
  },
  {
    id: "phl03_130km",
    name: "PHL-03 ~70–130 กม.",
    tag: "จรวด 300 มม.",
    summary: "ใช้ดูผลลึกเข้ามาในไทยจากจรวดระยะไกล 300 มม.",
    maxRangeKm: 130,
    systems: ["phl03"],
    zones: [
      {
        id: "130_z1",
        label: "0–20 กม. • ใกล้จุดยิงมาก",
        outerRadiusKm: 20,
        color: "#7f1d1d",
        evacHint:
          "หลีกเลี่ยงอย่างยิ่ง ทั้งเสี่ยงจากจรวดและการตอบโต้ทางทหาร",
      },
      {
        id: "130_z2",
        label: "20–60 กม. • สูง",
        outerRadiusKm: 60,
        color: "#f97316",
        evacHint: "ควรย้ายไปอยู่นอกระยะ 60 กม. หากเป็นไปได้",
      },
      {
        id: "130_z3",
        label: "60–100 กม. • ปานกลาง",
        outerRadiusKm: 100,
        color: "#eab308",
        evacHint:
          "เหมาะใช้เป็นแนวพักอพยพระยะกลาง แต่ยังอาจอยู่ในวิถีกระสุน",
      },
      {
        id: "130_z4",
        label: "100–130 กม. • ปลายระยะ",
        outerRadiusKm: 130,
        color: "#22c55e",
        evacHint:
          "ปลายระยะยิงโดยประมาณ ความเสี่ยงจากจรวดลดลงมากแต่ไม่เป็นศูนย์",
      },
    ],
  },
  {
    id: "worst_200km",
    name: "โหมดสมมติ 200 กม.",
    tag: "Worst case",
    summary:
      "เผื่อกรณีเลวร้ายที่สุด หากมีอาวุธยิงได้ราว 100–200 กม. (ไม่ผูกระบบจริงตรง ๆ)",
    maxRangeKm: 200,
    systems: ["phl03"], // ใช้ยึดเป็นฐานเฉย ๆ
    zones: [
      {
        id: "200_z1",
        label: "0–30 กม. • อันตรายมากที่สุด",
        outerRadiusKm: 30,
        color: "#7f1d1d",
        evacHint:
          "ถือว่าเป็นเขตห้ามอยู่ของพลเรือนในกรณีเกิดการยิงจริง",
      },
      {
        id: "200_z2",
        label: "30–80 กม. • สูง",
        outerRadiusKm: 80,
        color: "#f97316",
        evacHint:
          "หากมีการยิงจริงควรอพยพข้าม 80 กม. ให้ได้มากที่สุด",
      },
      {
        id: "200_z3",
        label: "80–150 กม. • ปานกลาง",
        outerRadiusKm: 150,
        color: "#eab308",
        evacHint:
          "ใช้รองรับการอพยพระยะกลาง แต่ยังควรเตรียมจุดรองรับลึกเข้าไปอีก",
      },
      {
        id: "200_z4",
        label: "150–200 กม. • ปลายระยะ",
        outerRadiusKm: 200,
        color: "#22c55e",
        evacHint:
          "ใช้เป็นโซนสำรองระยะไกล ความเสี่ยงจากจรวดลดลงมากที่สุดในโมเดลนี้",
      },
    ],
  },
];

/* ============ รายชื่อจังหวัดชายแดน + ปุ่มเลือก ============ */

const BORDER_PROVINCES = [
  { id: "all", label: "ทุกจังหวัด" },
  { id: "trat", label: "ตราด" },
  { id: "chanthaburi", label: "จันทบุรี" },
  { id: "sakaeo", label: "สระแก้ว" },
  { id: "buriram", label: "บุรีรัมย์" },
  { id: "surin", label: "สุรินทร์" },
  { id: "sisaket", label: "ศรีสะเกษ" },
  { id: "ubon", label: "อุบลราชธานี" },
];

/* ============ Preset แนวชายแดนต่อจังหวัด (ตัวอย่าง) ============ */

const SCENARIO_PRESETS = [
  {
    id: "trat",
    name: "ตราด – แนวชายแดนทะเล & คลองใหญ่",
    hint: "บ้านหาดเล็ก–คลองใหญ่ / ชายฝั่งติดกัมพูชา (ตัวแทน)",
    launchers: [
      {
        provinceId: "trat",
        lat: 11.8,
        lng: 102.88,
        name: "ตราด – บ้านหาดเล็ก (คลองใหญ่)",
      },
      {
        provinceId: "trat",
        lat: 12.0,
        lng: 102.75,
        name: "ตราด – แนวชายแดนตอนบน",
      },
    ],
  },
  {
    id: "chanthaburi",
    name: "จันทบุรี – แถวสอยดาว / โป่งน้ำร้อน",
    hint: "ด่านโป่งน้ำร้อน–เขาสอยดาว (ตัวแทน)",
    launchers: [
      {
        provinceId: "chanthaburi",
        lat: 12.7,
        lng: 102.25,
        name: "จันทบุรี – ด่านโป่งน้ำร้อน",
      },
      {
        provinceId: "chanthaburi",
        lat: 12.7,
        lng: 102.4,
        name: "จันทบุรี – แนวสอยดาว–เขาสอยดาว",
      },
    ],
  },
  {
    id: "sakaeo",
    name: "สระแก้ว – อรัญประเทศ / โรงเกลือ",
    hint: "แนวคลองลึก–ปอยเปต และแถวอรัญประเทศ",
    launchers: [
      {
        provinceId: "sakaeo",
        lat: 13.7,
        lng: 102.5,
        name: "สระแก้ว – แนวคลองลึก–ปอยเปต",
      },
      {
        provinceId: "sakaeo",
        lat: 13.55,
        lng: 102.6,
        name: "สระแก้ว – แนวใต้ อรัญประเทศ",
      },
      {
        provinceId: "sakaeo",
        lat: 13.85,
        lng: 102.4,
        name: "สระแก้ว – แนวเหนือ อรัญประเทศ",
      },
    ],
  },
  {
    id: "buriram",
    name: "บุรีรัมย์ – บ้านกรวด / โนนดินแดง",
    hint: "แนวดงรักตอนบนฝั่งบุรีรัมย์ (ตัวแทน)",
    launchers: [
      {
        provinceId: "buriram",
        lat: 14.45,
        lng: 103.1,
        name: "บุรีรัมย์ – บ้านกรวด–โนนดินแดง",
      },
      {
        provinceId: "buriram",
        lat: 14.6,
        lng: 103.0,
        name: "บุรีรัมย์ – แนวดงรักตอนบน",
      },
    ],
  },
  {
    id: "surin",
    name: "สุรินทร์ – ช่องจอม / กาบเชิง",
    hint: "แนวที่เคยมีข่าว BM-21 ยิงข้ามแดน (ตัวแทน)",
    launchers: [
      {
        provinceId: "surin",
        lat: 14.46,
        lng: 103.6,
        name: "สุรินทร์ – กาบเชิง–ช่องจอม",
      },
      {
        provinceId: "surin",
        lat: 14.4,
        lng: 103.45,
        name: "สุรินทร์ – แนวต่อเนื่องตะวันตก",
      },
      {
        provinceId: "surin",
        lat: 14.5,
        lng: 103.8,
        name: "สุรินทร์ – แนวต่อเนื่องตะวันออก",
      },
    ],
  },
  {
    id: "sisaket",
    name: "ศรีสะเกษ – กันทรลักษ์ / เขาพระวิหาร",
    hint: "แนวเขาพระวิหาร–สันเขาดงรัก (ตัวแทน)",
    launchers: [
      {
        provinceId: "sisaket",
        lat: 14.65,
        lng: 104.65,
        name: "ศรีสะเกษ – กันทรลักษ์–เขาพระวิหาร",
      },
      {
        provinceId: "sisaket",
        lat: 14.6,
        lng: 104.4,
        name: "ศรีสะเกษ – แนวสันเขาตอนบน",
      },
      {
        provinceId: "sisaket",
        lat: 14.55,
        lng: 104.9,
        name: "ศรีสะเกษ – แนวต่อเนื่องไปน้ำยืน",
      },
    ],
  },
  {
    id: "ubon",
    name: "อุบลราชธานี – น้ำยืน / ดงรักตอนล่าง",
    hint: "น้ำยืน–ดงรักตอนล่าง–สามเหลี่ยมชายแดน (ตัวแทน)",
    launchers: [
      {
        provinceId: "ubon",
        lat: 14.4,
        lng: 105.08,
        name: "อุบล – น้ำยืน–ดงรักตอนล่าง",
      },
      {
        provinceId: "ubon",
        lat: 14.55,
        lng: 105.05,
        name: "อุบล – แนวต่อเนื่องเหนือ",
      },
      {
        provinceId: "ubon",
        lat: 14.3,
        lng: 105.2,
        name: "อุบล – แนวต่อเนื่องตะวันออก",
      },
    ],
  },
];

/* ============================ หน้าเว็บหลัก ============================ */

export default function HomePage() {
  const [selectedWeaponId, setSelectedWeaponId] = useState(
    WEAPON_PROFILES[1].id,
  );

  // จังหวัดที่กำลังดูอยู่ (all = ทุกจังหวัด)
  const [activeProvinceId, setActiveProvinceId] = useState("all");

  // จุดตัวแทนครบทุกจังหวัดที่เสี่ยง (ตราด–อุบล) + provinceId
  const [launchers, setLaunchers] = useState([
    // 1) แถวตราด/จันทบุรี (ทะเลตะวันออก–ชายแดน)
    {
      id: 1,
      provinceId: "chanthaburi",
      name: "จุด 1 – แถวตราด/จันทบุรี (12.5438, 102.7826)",
      lat: 12.5438,
      lng: 102.7826,
    },

    // 2) สระแก้วตอนล่าง
    {
      id: 2,
      provinceId: "sakaeo",
      name: "จุด 2 – แถวสระแก้วตอนล่าง (13.2132, 102.5684)",
      lat: 13.2132,
      lng: 102.5684,
    },

    // 3) สระแก้วตอนบน
    {
      id: 3,
      provinceId: "sakaeo",
      name: "จุด 3 – แถวสระแก้วตอนบน (13.7901, 102.8320)",
      lat: 13.7901,
      lng: 102.8320,
    },

    // 4) ช่วงบุรีรัมย์/สุรินทร์
    {
      id: 4,
      provinceId: "buriram",
      name: "จุด 4 – แถวบุรีรัมย์/สุรินทร์ (14.2058, 103.1287)",
      lat: 14.2058,
      lng: 103.1287,
    },

    // 5) สุรินทร์ตอนล่าง
    {
      id: 5,
      provinceId: "surin",
      name: "จุด 5 – แถวสุรินทร์ตอนล่าง (14.2591, 103.7769)",
      lat: 14.2591,
      lng: 103.7769,
    },

    // 6) ศรีสะเกษตอนบน
    {
      id: 6,
      provinceId: "sisaket",
      name: "จุด 6 – แถวศรีสะเกษตอนบน (14.2644, 104.3756)",
      lat: 14.2644,
      lng: 104.3756,
    },

    // 7) ศรีสะเกษ/อุบล ตอนล่าง
    {
      id: 7,
      provinceId: "sisaket",
      name: "จุด 7 – แถวศรีสะเกษ/อุบลตอนล่าง (14.2484, 104.8755)",
      lat: 14.2484,
      lng: 104.8755,
    },
  ]);


  const [selectedLauncherId, setSelectedLauncherId] = useState(1);
  const [userLocation, setUserLocation] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);

  const selectedWeapon = useMemo(
    () =>
      WEAPON_PROFILES.find((w) => w.id === selectedWeaponId) ??
      WEAPON_PROFILES[0],
    [selectedWeaponId],
  );

  const selectedLauncher = useMemo(
    () => launchers.find((l) => l.id === selectedLauncherId) ?? null,
    [launchers, selectedLauncherId],
  );

  const systemsInProfile = useMemo(() => {
    const ids = selectedWeapon.systems ?? [];
    return CAMBODIA_MLRS.filter((s) => ids.includes(s.id));
  }, [selectedWeapon]);

  // launchers ที่จะแสดงบนแผนที่และในลิสต์ ตามจังหวัดที่เลือก
  const visibleLaunchers = useMemo(
    () =>
      activeProvinceId === "all"
        ? launchers
        : launchers.filter((l) => l.provinceId === activeProvinceId),
    [launchers, activeProvinceId],
  );

  // หาจุดยิงที่ใกล้ user ที่สุด (จากทุกจังหวัด)
  const nearestToUser = useMemo(() => {
    if (!userLocation || launchers.length === 0) return null;
    let best = null;
    for (const l of launchers) {
      const d = haversineDistance(
        l.lat,
        l.lng,
        userLocation.lat,
        userLocation.lng,
      );
      if (!best || d < best.distanceKm) {
        best = { launcher: l, distanceKm: d };
      }
    }
    return best;
  }, [userLocation, launchers]);

  // เพิ่มจุดจากแมพ (เฉพาะตอนเปิดโหมดวางจุด)
  const handleAddLauncherFromMap = (latlng) => {
    setLaunchers((prev) => [
      ...prev,
      {
        id: Date.now(),
        provinceId: "custom",
        name: `จุดใหม่ ${prev.length + 1}`,
        lat: latlng.lat,
        lng: latlng.lng,
      },
    ]);
  };

const handleResetLaunchers = () => {
  setLaunchers([
    {
      id: 1,
      provinceId: "chanthaburi",
      name: "จุด 1 – แถวตราด/จันทบุรี (12.5438, 102.7826)",
      lat: 12.5438,
      lng: 102.7826,
    },
    {
      id: 2,
      provinceId: "sakaeo",
      name: "จุด 2 – แถวสระแก้วตอนล่าง (13.2132, 102.5684)",
      lat: 13.2132,
      lng: 102.5684,
    },
    {
      id: 3,
      provinceId: "sakaeo",
      name: "จุด 3 – แถวสระแก้วตอนบน (13.7901, 102.8320)",
      lat: 13.7901,
      lng: 102.8320,
    },
    {
      id: 4,
      provinceId: "buriram",
      name: "จุด 4 – แถวบุรีรัมย์/สุรินทร์ (14.2058, 103.1287)",
      lat: 14.2058,
      lng: 103.1287,
    },
    {
      id: 5,
      provinceId: "surin",
      name: "จุด 5 – แถวสุรินทร์ตอนล่าง (14.2591, 103.7769)",
      lat: 14.2591,
      lng: 103.7769,
    },
    {
      id: 6,
      provinceId: "sisaket",
      name: "จุด 6 – แถวศรีสะเกษตอนบน (14.2644, 104.3756)",
      lat: 14.2644,
      lng: 104.3756,
    },
    {
      id: 7,
      provinceId: "sisaket",
      name: "จุด 7 – แถวศรีสะเกษ/อุบลตอนล่าง (14.2484, 104.8755)",
      lat: 14.2484,
      lng: 104.8755,
    },
  ]);

  setSelectedLauncherId(1);
  setMapFocus(null);
  setActiveProvinceId("all"); // ถ้าใช้ตัวเลือกจังหวัดอยู่
};


  const handleClearLaunchers = () => {
    setLaunchers([]);
    setSelectedLauncherId(null);
    setMapFocus(null);
  };

  const handleFocusLauncher = (l) => {
    setSelectedLauncherId(l.id);
    setMapFocus({ lat: l.lat, lng: l.lng, zoom: 8 });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        setMapFocus({ ...loc, zoom: 8 });
      },
      () => {
        alert("ไม่สามารถดึงตำแหน่งของคุณได้");
      },
    );
  };

  const applyScenario = (preset) => {
    const mapped = preset.launchers.map((p, index) => ({
      id: Date.now() + index,
      provinceId: p.provinceId ?? preset.id ?? "custom",
      name: p.name ?? `${preset.name} #${index + 1}`,
      lat: p.lat,
      lng: p.lng,
    }));
    setLaunchers((prev) => {
      // ล้างเฉพาะจังหวัดนั้น ๆ แล้วแทนด้วย preset
      const others = prev.filter((l) => l.provinceId !== preset.id);
      return [...others, ...mapped];
    });
    if (mapped[0]) {
      setSelectedLauncherId(mapped[0].id);
      setMapFocus({
        lat: mapped[0].lat,
        lng: mapped[0].lng,
        zoom: 8,
      });
    }
    setActiveProvinceId(preset.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-emerald-400 uppercase">
              CIVILIAN SAFETY TOOL
            </div>
            <h1 className="text-lg md:text-2xl font-semibold">
              แผนที่จำลองรัศมีจรวดกัมพูชา
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400">
              ใช้ข้อมูลเปิดเผยของระบบจรวดจริง + โหมดสมมติ 200 กม.
              เพื่อช่วยคนไทยวางแผนอพยพหนีวิถีกระสุนอย่างระมัดระวัง
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-[11px] text-slate-400">
            <span>เลื่อน/ซูมแผนที่ได้ตามปกติ</span>
            <span>ต้องกด “โหมดเพิ่มจุด” ก่อนจึงจะคลิกเพิ่มจุดยิงได้</span>
          </div>
        </div>
        <div className="w-full bg-amber-500/10 border-t border-amber-500/40 text-[11px] text-amber-200 text-center py-1">
          ⚠ เครื่องมือนี้เป็นการจำลองหยาบ ๆ เท่านั้น –
          การอพยพจริงต้องทำตามคำสั่งจากรัฐ/ทหาร/ปภ. เป็นหลักเสมอ
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-4 grid gap-4 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
          {/* Map + summary */}
          <section className="space-y-4">
            {/* Quick summary widgets */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                <div className="text-slate-400 mb-1">โหมดอาวุธ</div>
                <div className="font-semibold text-sm">
                  {selectedWeapon.name}
                </div>
                <div className="text-slate-400 text-[10px]">
                  {selectedWeapon.tag}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                <div className="text-slate-400 mb-1">จุดตั้งระบบทั้งหมด</div>
                <div className="font-semibold text-sm">
                  {launchers.length} จุด
                </div>
                <div className="text-slate-400 text-[10px]">
                  แก้ไข/เพิ่มได้เอง
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 col-span-2 md:col-span-1">
                <div className="text-slate-400 mb-1">จุดใกล้คุณที่สุด</div>
                {nearestToUser ? (
                  <>
                    <div className="font-semibold text-sm">
                      {nearestToUser.launcher.name}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      ห่างประมาณ {nearestToUser.distanceKm.toFixed(1)} กม.
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-[10px]">
                    ยังไม่ได้ตั้งตำแหน่งของฉัน
                  </div>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="h-[360px] md:h-[520px]">
              <HazardMap
                weapon={selectedWeapon}
                launchers={visibleLaunchers}
                selectedLauncherId={selectedLauncherId}
                setSelectedLauncherId={setSelectedLauncherId}
                onAddLauncher={handleAddLauncherFromMap}
                userLocation={userLocation}
                mapFocus={mapFocus}
                placementMode={placementMode}
              />
            </div>

            {/* Result for selected launcher + my location */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-[11px]">
              <h2 className="text-sm font-semibold mb-2">
                ผลการประเมินตำแหน่งของฉัน
              </h2>
              {selectedLauncher ? (
                <UserDistanceInfo
                  launcher={selectedLauncher}
                  zones={selectedWeapon.zones}
                  userLocation={userLocation}
                />
              ) : (
                <p className="text-slate-400">
                  ยังไม่ได้เลือกจุดตั้งระบบ –
                  เลือกจากรายการด้านขวาหรือคลิกวงกลมสีส้มบนแผนที่
                </p>
              )}
            </div>

            {/* Big warning */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-[11px] text-amber-100">
              ⚠ โมเดลนี้ใช้วงกลมอย่างง่าย ไม่คำนวณภูมิประเทศ วิถีกระสุนจริง
              หรือลม เป็นแค่เครื่องมือช่วยมองว่า “ถ้ายิงได้เต็มระยะ”
              วงครอบคลุมตรงไหนบ้าง การตัดสินใจอพยพต้องยึดประกาศจากรัฐ/ทหาร/ปภ.
              เป็นหลักเสมอ
            </div>
          </section>

          {/* Right control panel */}
          <section className="space-y-4">
            {/* Step 1: เลือกพื้นที่ชายแดน */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3 text-[11px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">
                  ขั้นที่ 1 – เลือกแนวชายแดน (จังหวัด)
                </h2>
                <span className="text-[10px] text-slate-400">
                  เลือกจังหวัดเพื่อโฟกัสจุดในพื้นที่นั้น
                </span>
              </div>

              {/* ปุ่มเลือกจังหวัด */}
              <div className="flex flex-wrap gap-2 mb-2">
                {BORDER_PROVINCES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProvinceId(p.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] border transition ${activeProvinceId === p.id
                        ? "bg-emerald-500 text-slate-900 border-emerald-400"
                        : "bg-slate-950/60 text-slate-100 border-slate-700 hover:border-slate-400"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-slate-400 mb-1">
                หรือใช้ preset แนวชายแดน (จะวาง/แทนจุดตามตัวอย่างของจังหวัดนั้น)
              </p>
              <div className="flex flex-wrap gap-2">
                {SCENARIO_PRESETS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => applyScenario(s)}
                    className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950/70 hover:border-emerald-400 transition text-left"
                  >
                    <div className="font-semibold text-xs">{s.name}</div>
                    <div className="text-slate-400 text-[10px]">
                      {s.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: เลือกโหมดอาวุธ */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3 text-[11px]">
              <h2 className="text-sm font-semibold">
                ขั้นที่ 2 – เลือกโหมดอาวุธ
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {WEAPON_PROFILES.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWeaponId(w.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 border transition ${selectedWeaponId === w.id
                        ? "border-emerald-400 bg-emerald-500/15"
                        : "border-slate-700 bg-slate-950/60 hover:border-slate-400"
                      }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="font-semibold text-xs">{w.name}</div>
                      <span className="text-[10px] text-slate-400">
                        สูงสุด {w.maxRangeKm} กม.
                      </span>
                    </div>
                    <div className="text-slate-300">{w.summary}</div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-2">
                <p className="text-[11px] font-semibold mb-1">
                  ซ้อนโซนรัศมีในโหมดนี้:
                </p>
                <div className="space-y-1">
                  {selectedWeapon.zones.map((z) => (
                    <div
                      key={z.id}
                      className="flex items-center gap-2 bg-slate-950/70 rounded-lg px-2 py-1"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full border border-white/40"
                        style={{ backgroundColor: z.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{z.label}</div>
                        <div className="text-slate-300 text-[10px]">
                          {z.evacHint}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: จุดตั้งระบบ + ตำแหน่งของฉัน */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3 text-[11px]">
              <h2 className="text-sm font-semibold">
                ขั้นที่ 3 – จุดตั้งระบบ & ตำแหน่งของฉัน
              </h2>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={handleResetLaunchers}
                  className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600"
                >
                  รีเซ็ตจุดทุกจังหวัด
                </button>
                <button
                  onClick={handleClearLaunchers}
                  className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600"
                >
                  ล้างจุดทั้งหมด
                </button>
                <button
                  onClick={() => setPlacementMode((v) => !v)}
                  className={`col-span-2 px-2 py-2 rounded-xl border text-xs font-semibold ${placementMode
                      ? "bg-cyan-500 text-slate-900 border-cyan-400"
                      : "bg-slate-800 text-slate-50 border-slate-600 hover:bg-slate-700"
                    }`}
                >
                  {placementMode
                    ? "ปิดโหมดเพิ่มจุดจากแผนที่"
                    : "เปิดโหมดเพิ่มจุดจากแผนที่"}
                </button>
                <button
                  onClick={handleUseMyLocation}
                  className="col-span-2 px-2 py-2 rounded-xl bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400"
                >
                  ใช้ตำแหน่งของฉัน (GPS)
                </button>
              </div>

              {/* Launcher list */}
              <div className="border-t border-slate-800 pt-2">
                <p className="text-[11px] text-slate-400 mb-1">
                  ตอนนี้กำลังดู:{" "}
                  <span className="font-semibold">
                    {
                      BORDER_PROVINCES.find((p) => p.id === activeProvinceId)
                        ?.label
                    }
                  </span>{" "}
                  (จุดที่แสดงคือจังหวัดนี้เท่านั้น)
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {visibleLaunchers.length === 0 && (
                    <div className="text-[11px] text-slate-300">
                      ยังไม่มีจุดตั้งระบบในจังหวัดที่เลือก –
                      เปิดโหมดเพิ่มจุดแล้วคลิกบนแผนที่
                      หรือใช้ preset จังหวัดด้านบน
                    </div>
                  )}
                  {visibleLaunchers.map((l) => (
                    <div
                      key={l.id}
                      className={`rounded-xl px-3 py-2 text-[11px] border flex flex-col gap-1 ${selectedLauncherId === l.id
                          ? "border-cyan-400 bg-slate-900"
                          : "border-slate-700 bg-slate-950/70"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          defaultValue={l.name}
                          onBlur={(e) => {
                            const name = e.target.value || l.name;
                            setLaunchers((prev) =>
                              prev.map((x) =>
                                x.id === l.id ? { ...x, name } : x,
                              ),
                            );
                          }}
                          className="bg-transparent border border-slate-600 rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                        <button
                          onClick={() => handleFocusLauncher(l)}
                          className="px-2 py-1 rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400"
                        >
                          โฟกัส
                        </button>
                      </div>
                      <div className="text-slate-300">
                        lat {l.lat.toFixed(4)}, lng {l.lng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reference: รายการระบบจรวดทั้งหมด */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg text-[11px]">
              <h2 className="text-sm font-semibold mb-2">
                ข้อมูลระบบจรวดที่กัมพูชามี (ข้อมูลเปิดเผยสรุป)
              </h2>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {CAMBODIA_MLRS.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2"
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-slate-300">
                      ระยะประมาณ: {s.approxRangeKm}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      บทบาท: {s.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ======= คำนวณระยะทาง & หาโซนที่ผู้ใช้อยู่ ======= */

function UserDistanceInfo({ launcher, zones, userLocation }) {
  if (!userLocation) {
    return (
      <p className="text-slate-400">
        ยังไม่ได้ตั้ง “ตำแหน่งของฉัน” – กดปุ่มใช้ตำแหน่งของฉัน (GPS)
        ด้านขวาก่อน
      </p>
    );
  }

  const distanceKm = haversineDistance(
    launcher.lat,
    launcher.lng,
    userLocation.lat,
    userLocation.lng,
  );

  const zone =
    zones.find((z) => distanceKm <= z.outerRadiusKm) ??
    zones[zones.length - 1];

  return (
    <div>
      <p className="text-slate-200">
        จุดที่เลือก:{" "}
        <span className="font-semibold">{launcher.name}</span> • lat{" "}
        {launcher.lat.toFixed(4)}, lng {launcher.lng.toFixed(4)}
      </p>
      <p className="mt-1">
        คุณห่างจากจุดนี้ประมาณ{" "}
        <span className="font-semibold">
          {distanceKm.toFixed(1)} กม.
        </span>
      </p>
      <p className="mt-1">
        โซนโดยประมาณ:{" "}
        <span className="font-semibold" style={{ color: zone.color }}>
          {zone.label}
        </span>
      </p>
      <p className="text-slate-200">คำแนะนำเบื้องต้น: {zone.evacHint}</p>
      <p className="text-[10px] text-slate-400 mt-1">
        * ระยะจริงอาจต่างจากนี้มาก ขึ้นกับความแม่นยำของ GPS
        และปัจจัยทางยุทธวิธีในสนามจริง
      </p>
    </div>
  );
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
