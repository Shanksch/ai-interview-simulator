import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const techIcons = await getTechLogos(techStack);

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-lp-surface-2 border border-white/[0.06] rounded-full p-1.5 flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:z-10",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;