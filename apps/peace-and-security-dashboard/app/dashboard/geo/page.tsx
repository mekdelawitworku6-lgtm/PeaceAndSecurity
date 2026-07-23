"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCities,
  fetchSubcities,
  fetchWoredas,
  createCity,
  createSubcity,
  createWoreda,
  deleteCity,
  deleteSubcity,
  deleteWoreda,
  selectCities,
  selectSubcities,
  selectWoredas,
  selectGeoLoading,
} from "@/lib/store/geoSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, MapPin, Building, FileText } from "lucide-react";

type Tab = "cities" | "subcities" | "woredas";

export default function GeoPage() {
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const subcities = useAppSelector(selectSubcities);
  const woredas = useAppSelector(selectWoredas);
  const loading = useAppSelector(selectGeoLoading);

  const [activeTab, setActiveTab] = useState<Tab>("cities");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedSubcityId, setSelectedSubcityId] = useState("");

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchSubcities());
    dispatch(fetchWoredas());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (activeTab === "cities") {
        await dispatch(createCity({ name, nameAm })).unwrap();
        toast.success("City created");
      } else if (activeTab === "subcities") {
        if (!selectedCityId) { toast.error("Select a city"); return; }
        await dispatch(createSubcity({ name, nameAm, cityId: selectedCityId })).unwrap();
        toast.success("Subcity created");
      } else {
        if (!selectedSubcityId) { toast.error("Select a subcity"); return; }
        await dispatch(createWoreda({ name, nameAm, subcityId: selectedSubcityId })).unwrap();
        toast.success("Woreda created");
      }
      setDialogOpen(false);
      setName(""); setNameAm(""); setSelectedCityId(""); setSelectedSubcityId("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create");
    }
  };

  const handleDelete = async (tab: Tab, id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      if (tab === "cities") await dispatch(deleteCity(id)).unwrap();
      else if (tab === "subcities") await dispatch(deleteSubcity(id)).unwrap();
      else await dispatch(deleteWoreda(id)).unwrap();
      toast.success("Deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Geographic Management</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {activeTab === "cities" ? "City" : activeTab === "subcities" ? "Subcity" : "Woreda"}
        </Button>
      </div>

      <div className="flex gap-2">
        {(["cities", "subcities", "woredas"] as Tab[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "cities" && <Building className="mr-2 h-4 w-4" />}
            {tab === "subcities" && <MapPin className="mr-2 h-4 w-4" />}
            {tab === "woredas" && <FileText className="mr-2 h-4 w-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{activeTab}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-2">
              {(activeTab === "cities" ? cities : activeTab === "subcities" ? subcities : woredas).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.nameAm && <p className="text-sm text-muted-foreground">{item.nameAm}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(activeTab, item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {(activeTab === "cities" ? cities : activeTab === "subcities" ? subcities : woredas).length === 0 && (
                <p className="text-muted-foreground text-center py-4">No items found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {activeTab === "cities" ? "City" : activeTab === "subcities" ? "Subcity" : "Woreda"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Amharic Name (optional)" value={nameAm} onChange={(e) => setNameAm(e.target.value)} />
            {activeTab === "subcities" && (
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                <SelectContent>
                  {cities.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {activeTab === "woredas" && (
              <Select value={selectedSubcityId} onValueChange={setSelectedSubcityId}>
                <SelectTrigger><SelectValue placeholder="Select Subcity" /></SelectTrigger>
                <SelectContent>
                  {subcities.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
