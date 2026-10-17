import Image from "next/image";
import Link from "next/link";

/**
 * Marca do negócio: o logo horizontal (public/logo.png, 1000×408) já traz o nome.
 * Para fundo escuro existe public/logo-escuro.png (slogan em branco).
 */
export function Brand({ name, href = "/" }: { name: string; href?: string }) {
  return (
    <Link href={href} className="flex items-center" aria-label={name}>
      <Image src="/logo.png" alt={name} width={1000} height={408} className="h-11 w-auto" priority />
    </Link>
  );
}
