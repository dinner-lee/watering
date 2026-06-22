import { PLANT_EMOJI, PLANT_IMAGE } from "@/lib/plants";

// 식물 아이콘: 전용 픽셀 이미지가 있으면 이미지로, 없으면 이모지로 렌더.
export default function PlantIcon({ plant, size = 32 }: { plant: string; size?: number }) {
  const img = PLANT_IMAGE[plant];
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt={plant}
        width={size}
        height={size}
        style={{ width: size, height: size, imageRendering: "pixelated" }}
        className="inline-block"
      />
    );
  }
  return (
    <span style={{ fontSize: size * 0.85, lineHeight: 1 }} className="inline-block">
      {PLANT_EMOJI[plant] ?? "🌿"}
    </span>
  );
}
