"use client";
import { useRouter } from "next/navigation";
export default function Home() {
 const r = useRouter();
 return (
<div className="h-screen flex flex-col justify-center items-center gap-4">
<button onClick={() => r.push("/student")} className="bg-blue-500 text-white p-3">
       Student
</button>
<button onClick={() => r.push("/teacher")} className="bg-green-500 text-white p-3">
       Teacher
</button>
</div>
 );
}