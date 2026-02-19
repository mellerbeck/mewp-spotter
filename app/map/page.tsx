import Nav from "../components/Nav"
import MapClient from "./MapClient"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Nav />
      <MapClient />
    </div>
  )
}
