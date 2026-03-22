import { wedding } from "./data/wedding";
import { WeddingInvite } from "./WeddingInvite";
import "./index.css";

export default function App() {
  return (
    <div className="app-shell">
      <WeddingInvite data={wedding} />
    </div>
  );
}
