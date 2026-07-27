
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { fetchReportTypes, deleteReportType as deleteReportTypeThunk, selectReportTypes, selectReportTypesLoading, selectReportTypesTotal, selectReportTypesTotalPages } from "@/lib/store/reportTypesSlice"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Settings2,
    Trash2,
    Search,
    Filter,
    ClipboardList,
    AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ReportTypeForm } from "@/components/forms/report-type-form"
import { ReportTypeTable } from "@/components/report-types/report-type-table"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { DashboardPagination } from "@/components/tables/dashboard-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function ReportTypesPage() {
    const dispatch = useAppDispatch()
    const reportTypes = useAppSelector(selectReportTypes)
    const loading = useAppSelector(selectReportTypesLoading)
    const total = useAppSelector(selectReportTypesTotal)
    const totalPages = useAppSelector(selectReportTypesTotalPages)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [selectedReportType, setSelectedReportType] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [confirmTarget, setConfirmTarget] = useState<any>(null)
    const [confirmLoading, setConfirmLoading] = useState(false)

    useEffect(() => {
        dispatch(fetchReportTypes({ search: searchTerm || undefined, page, limit }))
    }, [dispatch, searchTerm, page, limit])

    const handleDelete = (type: any) => {
        setConfirmTarget(type)
        setConfirmOpen(true)
    }

    const executeDelete = async () => {
        if (!confirmTarget) return
        setConfirmLoading(true)
        try {
            await dispatch(deleteReportTypeThunk(confirmTarget.id)).unwrap()
            toast.success("Report type deleted")
            setConfirmOpen(false)
            setConfirmTarget(null)
        } catch (error) {
            toast.error("Failed to delete")
        } finally {
            setConfirmLoading(false)
        }
    }

    return (
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Report Types</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage the categories of issues citizens can report.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search types..."
                            className="pl-10 rounded-xl bg-white border-slate-200 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl font-bold gap-2 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto" onClick={() => {
                                setSelectedReportType(null)
                                setIsDialogOpen(true)
                            }}>
                                <Plus className="w-5 h-5" />
                                Add Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl rounded-3xl p-8 border-none shadow-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
                            <DialogHeader className="mb-6">
                                <DialogTitle className="text-2xl font-black text-slate-900">{selectedReportType ? 'Edit Report Type' : 'Register New Type'}</DialogTitle>
                                <DialogDescription className="font-medium text-slate-500">
                                    Define validation rules and sound thresholds for this category.
                                </DialogDescription>
                            </DialogHeader>
                            <ReportTypeForm
                                initialData={selectedReportType}
                                onSuccess={() => {
                                    setIsDialogOpen(false)
                                    dispatch(fetchReportTypes({ search: searchTerm || undefined, page, limit }))
                                }}
                                onCancel={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <ReportTypeTable
                    data={reportTypes}
                    loading={loading}
                    onDetail={(type) => {
                        setSelectedReportType(type)
                        setIsDetailOpen(true)
                    }}
                    onEdit={(type) => {
                        setSelectedReportType(type)
                        setIsDialogOpen(true)
                    }}
                    onDelete={handleDelete}
                />
            </div>

            <DashboardPagination
                page={page}
                totalPages={totalPages}
                total={total}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={setLimit}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Report Type"
                description={`Are you sure you want to delete ${confirmTarget?.name}? This might affect existing reports.`}
                confirmLabel="Delete"
                variant="destructive"
                loading={confirmLoading}
                onConfirm={executeDelete}
            />

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-xl rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-slate-900">Category Details</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Full information about the "{selectedReportType?.name}" category.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReportType && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Description</label>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedReportType.description || 'No description available.'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Status</label>
                                        <Badge className={selectedReportType.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}>
                                            {selectedReportType.isActive ? 'Active' : 'Hidden'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">System ID</label>
                                        <code className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">{selectedReportType.id}</code>
                                    </div>
                                </div>
                            </div>

                            {selectedReportType.name.toLowerCase().includes('noise') && (
                                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                                    <h4 className="text-sm font-black text-rose-900 mb-4 flex items-center gap-2">
                                        <AlertCircle size={16} /> Noise Thresholds
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm text-center">
                                            <span className="block text-[10px] font-black text-rose-400 uppercase mb-1">Residential</span>
                                            <span className="text-lg font-black text-rose-700">{selectedReportType.residentialDecibelThreshold} <small className="text-[10px]">dB</small></span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm text-center">
                                            <span className="block text-[10px] font-black text-rose-400 uppercase mb-1">Commercial</span>
                                            <span className="text-lg font-black text-rose-700">{selectedReportType.commercialDecibelThreshold} <small className="text-[10px]">dB</small></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setIsDetailOpen(false)} className="rounded-xl font-bold px-8">Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
