import { useEffect, useState } from "react";
import axios from "axios";

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then(res => setEvents(res.data.events || []))
      .catch(err => console.error(err));
  }, []);

  if (events.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-6">
        No events available
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {events.map(e => (
        <div key={e._id} className="border p-4 rounded shadow">
          <h3 className="font-bold">{e.title}</h3>
          <p className="text-sm">{e.location?.city}</p>
        </div>
      ))}
    </div>
  );
}
