import { useEffect, useState } from "react";
import axios from "axios";

export default function RecommendedEvents() {
  const [list, setList] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:5000/api/recommend", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setList(res.data.recommended))
    .catch(err => console.log(err));
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3">🎯 Événements recommandés</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map(e => (
          <div key={e._id} className="p-3 border rounded shadow">
            <h3 className="font-bold">{e.title}</h3>
            <p className="text-sm">{e.location?.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
