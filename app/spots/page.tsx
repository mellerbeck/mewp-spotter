import Nav from "../components/Nav"
import SpotsClient from "./SpotsClient"

export default function SpotsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Nav />
      <SpotsClient />
    </div>
  )
}
