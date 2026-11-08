import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold text-green-700">LahanSense</h1>
      <p className="max-w-md text-gray-600">
        Tanpa sensor. Gambar lahan Anda, dapatkan rekomendasi irigasi harian dan peringatan dini kekeringan.
      </p>
      <Link href="/dashboard" className="rounded bg-green-600 px-5 py-3 font-medium text-white">
        Mulai
      </Link>
    </main>
  );
}
