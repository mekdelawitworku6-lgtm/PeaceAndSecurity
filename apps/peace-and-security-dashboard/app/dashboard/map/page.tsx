
"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/app/context/auth-context"
import { dashboardService } from "@/lib/services/dashboard-service"
import { EcoGoogleMap } from "@/components/maps/google-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map as MapIcon, Shield, User, AlertTriangle, RefreshCw, Search, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const SUBCITIES: Record<string, { label: string; lat: number; lng: number; zoom: number }> = {
    ALL: { label: "All Addis Ababa", lat: 9.03, lng: 38.74, zoom: 12 },
    BOLE: { label: "Bole", lat: 8.9806, lng: 38.7844, zoom: 14 },
    KIRKOS: { label: "Kirkos", lat: 9.0069, lng: 38.7525, zoom: 14 },
    ARADA: { label: "Arada", lat: 9.0350, lng: 38.7520, zoom: 14 },
    YEKA: { label: "Yeka", lat: 9.0322, lng: 38.8050, zoom: 14 },
    LIDETA: { label: "Lideta", lat: 9.0125, lng: 38.7350, zoom: 14 },
    NIFAS_SILK: { label: "Nifas Silk-Lafto", lat: 8.9650, lng: 38.7300, zoom: 14 },
    KOLFE_KERANIO: { label: "Kolfe Keranio", lat: 9.0150, lng: 38.7050, zoom: 14 },
    GULELE: { label: "Gulele", lat: 9.0650, lng: 38.7400, zoom: 14 },
    AKAKY_KALITI: { label: "Akaky Kaliti", lat: 8.9200, lng: 38.7700, zoom: 14 },
    ADDIS_KETEMA: { label: "Addis Ketema", lat: 9.0300, lng: 38.7300, zoom: 14 },
}

export default function FleetMapPage() {
    const [locations, setLocations] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedSubcity, setSelectedSubcity] = useState<string>("ALL")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [entityType, setEntityType] = useState<"ALL" | "PATROL" | "CITIZEN" | "REPORT">("ALL")

    const loadLocations = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true)
            else setLoading(true)

            const res = await dashboardService.getFleetLocations()
            if (res && res.data) {
                setLocations(res.data)
            }
        } catch (error) {
            console.error("Failed to load fleet locations:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadLocations()
        const interval = setInterval(() => loadLocations(true), 15000)
        return () => clearInterval(interval)
    }, [])

    const allMarkers = useMemo(() => {
        return [
            ...(locations?.patrols || []).map((p: any) => ({
                id: `patrol-${p.id}`,
                lat: Number(p.latitude || p.officeLatitude),
                lng: Number(p.longitude || p.officeLongitude),
                title: `Patrol: ${p.fullName}`,
                icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                data: { type: 'PATROL', ...p }
            })),
            ...(locations?.citizens || []).map((c: any) => ({
                id: `citizen-${c.id}`,
                lat: Number(c.latitude),
                lng: Number(c.longitude),
                title: `Citizen: ${c.fullName}`,
                icon: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                data: { type: 'CITIZEN', ...c }
            })),
            ...(locations?.reports || []).map((r: any) => ({
                id: `report-${r.id}`,
                lat: Number(r.latitude),
                lng: Number(r.longitude),
                title: `Report: ${r.violationType}`,
                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                data: { type: 'REPORT', ...r }
            }))
        ].filter(m => !isNaN(m.lat) && !isNaN(m.lng))
    }, [locations])

    const filteredMarkers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const subcityConfig = SUBCITIES[selectedSubcity]
        const subcityLabel = selectedSubcity === "ALL" ? "" : subcityConfig?.label.toLowerCase()

        return allMarkers.filter((m: any) => {
            // Filter by entity type
            if (entityType !== "ALL" && m.data.type !== entityType) return false

            const data = m.data
            const textFields = [
                data.fullName,
                data.phoneNumber,
                data.assignedArea,
                data.officeAddress,
                data.address,
                data.area,
                data.violationType,
                data.caseId,
                data.reportDescription,
                data.description,
            ].filter(Boolean).map((s: any) => String(s).toLowerCase())

            // Filter by Subcity location
            if (subcityLabel) {
                const matchesSubcity = textFields.some(t => t.includes(subcityLabel))
                if (!matchesSubcity) {
                    // Approximate lat/lng radius if coordinates available
                    const dLat = Math.abs(m.lat - subcityConfig.lat)
                    const dLng = Math.abs(m.lng - subcityConfig.lng)
                    if (dLat > 0.04 || dLng > 0.04) return false
                }
            }

            // Search query filter
            if (query) {
                const matchesQuery = textFields.some(t => t.includes(query)) || m.title.toLowerCase().includes(query)
                if (!matchesQuery) return false
            }

            return true
        })
    }, [allMarkers, entityType, selectedSubcity, searchQuery])

    const activeSubcity = SUBCITIES[selectedSubcity] || SUBCITIES.ALL
    const patrolCount = filteredMarkers.filter(m => m.data.type === 'PATROL').length
    const citizenCount = filteredMarkers.filter(m => m.data.type === 'CITIZEN').length
    const reportCount = filteredMarkers.filter(m => m.data.type === 'REPORT').length

    return (
        <div className="p-4 md:p-10 space-y-6 md:space-y-8 min-h-screen flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <MapIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        Live Fleet & Report Map
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight">Real-time GPS tracking of active patrol units and reported violations with location filtering.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => loadLocations(true)}
                    disabled={refreshing}
                    className="rounded-xl font-bold gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Location / Subcity Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <Select value={selectedSubcity} onValueChange={setSelectedSubcity}>
                            <SelectTrigger className="rounded-xl h-10 border-slate-200 bg-white font-medium text-xs">
                                <SelectValue placeholder="Filter Location" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(SUBCITIES).map(([key, item]) => (
                                    <SelectItem key={key} value={key} className="text-xs">
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, address, or incident..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 rounded-xl border-slate-200 text-xs bg-white"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Entity Type Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                    {(["ALL", "PATROL", "CITIZEN", "REPORT"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setEntityType(type)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                                entityType === type
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            {type === "ALL"
                                ? "All Units"
                                : type === "PATROL"
                                ? "Patrols"
                                : type === "CITIZEN"
                                ? "Citizens"
                                : "Incidents"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0">
                <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative min-h-[400px] md:min-h-0">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Initializing Map...</p>
                            </div>
                        </div>
                    ) : null}
                    <EcoGoogleMap
                        key={`${selectedSubcity}-${activeSubcity.lat}-${activeSubcity.lng}`}
                        markers={filteredMarkers}
                        zoom={activeSubcity.zoom}
                        center={{ lat: activeSubcity.lat, lng: activeSubcity.lng }}
                    />
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Filtered Status</CardTitle>
                                {selectedSubcity !== "ALL" && (
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {activeSubcity.label}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">Active Patrols</span>
                                </div>
                                <span className="text-lg font-black text-slate-900">{patrolCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-bold text-slate-700">Tracking Citizens</span>
                                </div>
                                <span className="text-lg font-black text-slate-900">{citizenCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    <span className="text-sm font-bold text-slate-700">Open Incidents</span>
                                </div>
                                <span className="text-lg font-black text-slate-900">{reportCount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Map Legend</h4>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-slate-600">Patrol Officer</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-xs font-bold text-slate-600">Active Citizen</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500" />
                                <span className="text-xs font-bold text-slate-600">Open Violation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
