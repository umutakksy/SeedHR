"use client";

import React, { useState, useEffect } from "react";
import { userAPI, UserDto, DepartmentDto, mockDb } from "@/lib/api";
import { GitFork, Search, MapPin, Briefcase, Eye, X, Network, List } from "lucide-react";
import { clsx } from "clsx";

interface OrgNode {
  user: UserDto;
  children: OrgNode[];
}

export default function OrgChartTab() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");

  // Selected profile detail modal
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await userAPI.getAll();
      if (usersRes.success) {
        setUsers(usersRes.data);
      }
      setDepartments(mockDb.departments);
    } catch (err) {
      console.error("Org chart data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique locations
  const locations = Array.from(new Set(users.map(u => u.location).filter(Boolean))) as string[];

  // Determine active matching node IDs
  const matchingIds = new Set<string>();
  users.forEach(u => {
    let matches = true;
    if (searchQuery && !u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) && !u.positionTitle?.toLowerCase().includes(searchQuery.toLowerCase())) {
      matches = false;
    }
    if (selectedLocation !== "all" && u.location !== selectedLocation) {
      matches = false;
    }
    if (selectedDept !== "all" && u.departmentId !== selectedDept) {
      matches = false;
    }
    if (matches) {
      matchingIds.add(u.id);
    }
  });

  // Backpropagate visibility to parents so tree stays connected
  const visibleIds = new Set<string>();
  const addParentToVisible = (userId: string) => {
    visibleIds.add(userId);
    const user = users.find(u => u.id === userId);
    if (user?.managerId) {
      addParentToVisible(user.managerId);
    }
  };

  matchingIds.forEach(id => {
    addParentToVisible(id);
  });

  // Build hierarchical tree structure recursively
  const buildTree = (nodesList: UserDto[]): OrgNode[] => {
    const nodeMap: Record<string, OrgNode> = {};
    nodesList.forEach(u => {
      nodeMap[u.id] = { user: u, children: [] };
    });

    const roots: OrgNode[] = [];
    nodesList.forEach(u => {
      const node = nodeMap[u.id];
      if (u.managerId && nodeMap[u.managerId]) {
        nodeMap[u.managerId].children.push(node);
      } else {
        // Root nodes: either has no manager, or manager is not in list
        roots.push(node);
      }
    });

    return roots;
  };

  // Build tree only containing visible nodes (matching + their parents)
  const filteredUsersForTree = users.filter(u => visibleIds.has(u.id));
  const treeRoots = buildTree(filteredUsersForTree);

  // Render a single node in the tree recursively
  const renderTreeNode = (node: OrgNode) => {
    const isMatching = matchingIds.has(node.user.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.user.id} className="flex flex-col items-center relative">
        {/* Node Card */}
        <div
          onClick={() => setSelectedUser(node.user)}
          className={clsx(
            "p-3 rounded-xl border shadow-sm cursor-pointer transition-all duration-300 w-44 text-center shrink-0 hover:-translate-y-0.5 hover:shadow-md select-none",
            isMatching
              ? "bg-white border-indigo-500 text-slate-800 ring-2 ring-indigo-500/10 dark:bg-zinc-900 dark:border-indigo-500 dark:text-white"
              : "bg-slate-50/70 border-slate-200 text-slate-400 opacity-50 dark:bg-zinc-950/40 dark:border-zinc-800 dark:text-zinc-500"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-300 mx-auto mb-1 uppercase">
            {node.user.firstName[0]}
            {node.user.lastName[0]}
          </div>
          <div className="font-bold text-[11px] truncate leading-tight">{node.user.fullName}</div>
          <div className="text-[9px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate leading-none">
            {node.user.positionTitle || "Personel"}
          </div>
          <div className="text-[8px] mt-1.5 px-1.5 py-0.5 rounded-full inline-block font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-950/50">
            {node.user.location || "İstanbul Merkez"}
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && (
          <div className="flex flex-col items-center w-full">
            {/* Vertical connector line downward */}
            <div className="w-0.5 h-6 bg-slate-200 dark:bg-zinc-800" />

            {/* Horizontal line wrapping all children */}
            <div className="flex gap-6 relative px-4">
              {/* Connector lines inside the row */}
              {node.children.length > 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-44px)] h-0.5 bg-slate-200 dark:bg-zinc-800" />
              )}
              {node.children.map(child => (
                <div key={child.user.id} className="relative flex flex-col items-center">
                  {/* Vertical connector line upward to meet horizontal */}
                  <div className="w-0.5 h-3 bg-slate-200 dark:bg-zinc-800" />
                  {renderTreeNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top search & filter bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-zinc-900 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim veya Pozisyon Ara..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
            >
              <option value="all">Tüm Lokasyonlar</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:bg-zinc-950 dark:border-slate-800 dark:text-white"
            >
              <option value="all">Tüm Departmanlar</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Switcher buttons */}
        <div className="flex gap-2 bg-slate-50 dark:bg-zinc-950 p-1 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setViewMode("tree")}
            className={clsx(
              "flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg transition",
              viewMode === "tree"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            )}
          >
            <Network size={12} /> Hiyerarşik Ağaç
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={clsx(
              "flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-lg transition",
              viewMode === "list"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            )}
          >
            <List size={12} /> Grid Kart Görünümü
          </button>
        </div>
      </div>

      {/* Main visualization container */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-zinc-900 min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">Hiçbir personel kaydı bulunamadı.</p>
        ) : viewMode === "tree" ? (
          /* Tree visualizer with horizontal scrolling */
          <div className="w-full overflow-x-auto pb-6">
            <div className="flex justify-center min-w-max p-4">
              <div className="flex flex-col items-center gap-6">
                {treeRoots.map(root => renderTreeNode(root))}
                {treeRoots.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-12">Bu filtrelere uyan hiyerarşi dalı bulunamadı.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid list view */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users
              .filter(u => matchingIds.has(u.id))
              .map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className="p-4 border border-slate-100 rounded-xl dark:border-slate-800 bg-slate-50/20 dark:bg-zinc-900/40 hover:shadow-md cursor-pointer transition select-none flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{u.fullName}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate">{u.positionTitle || "Personel"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-[9px] text-slate-500 dark:text-zinc-400 border-t border-slate-100/50 pt-2.5 dark:border-slate-800/50">
                    <span>📍 {u.location || "Merkez Ofis"}</span>
                    <span>🏢 {u.departmentName || "Genel"}</span>
                  </div>
                </div>
              ))}
            {users.filter(u => matchingIds.has(u.id)).length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">Aradığınız kriterlere uygun personel bulunamadı.</div>
            )}
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="font-bold text-slate-950 dark:text-white">Hızlı Profil Detayı</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {selectedUser.firstName[0]}
                  {selectedUser.lastName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{selectedUser.fullName}</h4>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{selectedUser.positionTitle || "Geliştirici"}</p>
                  <span className="mt-1.5 inline-block text-[9px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    {selectedUser.roleName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-4 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Departman:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedUser.departmentName || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Yönetici:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedUser.managerName || "Yok"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">E-posta:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Telefon:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedUser.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Lokasyon:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedUser.location || "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">İşe Giriş Tarihi:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedUser.hireDate ? new Date(selectedUser.hireDate).toLocaleDateString("tr-TR") : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
