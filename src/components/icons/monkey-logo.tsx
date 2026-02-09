import Image from 'next/image';
import { cn } from "@/lib/utils"

// NOTE: This is a placeholder. To use your own logo,
// add your image file (e.g., logo.png) to the `public` folder
// and update the `src` property below to `/logo.png`.
export function MonkeyLogo({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Image
        src="/logo.png"
        alt="MONEY MAAMA Logo"
        width={40}
        height={40}
        className={cn("rounded-full", className)}
    />
  )
}
