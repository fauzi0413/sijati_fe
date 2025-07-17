import React from "react";
import { Link } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  PaperClipIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";


export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#050C56] text-white p-6 space-y-6 fixed">
      <h1 className="text-xl font-bold"><a href="/">SI JATI</a></h1>

      <nav className="space-y-5">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
          <span className="font-medium">Create Chat</span>
        </Link>

        <Link
          to="/faq"
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <span className="font-medium">Manage FAQ</span>
        </Link>

        <Link
          to="/statistik"
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span className="font-medium">Chat Statistics</span>
        </Link>

        <Link
          to="/upload"
          className="flex items-center gap-2 hover:text-gray-300"
        >
          <PaperClipIcon className="w-5 h-5" />
          <span className="font-medium">Upload Document</span>
        </Link>
      </nav>
    </aside>
  );
}
