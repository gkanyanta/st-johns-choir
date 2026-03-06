"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/hooks";
import { PageLoading, Spinner } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Settings as SettingsIcon } from "lucide-react";
import { PENALTY_TYPE_LABELS, EVENT_TYPE_LABELS } from "@/lib/constants";

interface PenaltyRule {
  id: string;
  name: string;
  penaltyType: string;
  amount: number;
  gracePeriodMin: number;
  isActive: boolean;
  description: string | null;
}

interface Section {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export default function SettingsPage() {
  const { data: settingsData, loading: settingsLoading } = useApi<{ settings: Record<string, string> }>("/api/settings");
  const { data: rulesData, loading: rulesLoading, refetch: refetchRules } = useApi<{ rules: PenaltyRule[] }>("/api/penalties/rules");
  const { data: sectionsData, loading: sectionsLoading, refetch: refetchSections } = useApi<{ sections: Section[] }>("/api/sections");

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Rule dialog
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    penaltyType: "LATE_COMING",
    amount: "",
    gracePeriodMin: "",
    description: "",
  });
  const [addingRule, setAddingRule] = useState(false);

  // Section dialog
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings(settingsData.settings);
    }
  }, [settingsData]);

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaveMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const addRule = async () => {
    setAddingRule(true);
    try {
      const res = await fetch("/api/penalties/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRule,
          amount: parseFloat(newRule.amount) || 0,
          gracePeriodMin: parseInt(newRule.gracePeriodMin) || 0,
          description: newRule.description || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to add rule" }));
        throw new Error(data.error || "Failed to add rule");
      }
      setRuleDialogOpen(false);
      setNewRule({ name: "", penaltyType: "LATE_COMING", amount: "", gracePeriodMin: "", description: "" });
      refetchRules();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add rule");
    } finally {
      setAddingRule(false);
    }
  };

  const addSection = async () => {
    if (!newSectionName.trim()) return;
    setAddingSection(true);
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSectionName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to add section" }));
        throw new Error(data.error || "Failed to add section");
      }
      setSectionDialogOpen(false);
      setNewSectionName("");
      refetchSections();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add section");
    } finally {
      setAddingSection(false);
    }
  };

  if (settingsLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage system configuration" />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Choir Name</Label>
              <Input
                value={settings.choir_name || ""}
                onChange={(e) => setSettings({ ...settings, choir_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Church Name</Label>
              <Input
                value={settings.church_name || ""}
                onChange={(e) => setSettings({ ...settings, church_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency Code</Label>
              <Input
                value={settings.currency || "ZMW"}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency Symbol</Label>
              <Input
                value={settings.currency_symbol || "K"}
                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default Grace Period (minutes)</Label>
            <Input
              type="number"
              value={settings.default_grace_period || "15"}
              onChange={(e) => setSettings({ ...settings, default_grace_period: e.target.value })}
              className="w-32"
            />
          </div>

          {saveMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Spinner className="mr-2" /> : null}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Penalty Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Penalty Rules</CardTitle>
            <Button size="sm" onClick={() => setRuleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Penalty Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Rule Name *</Label>
                    <Input
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="e.g. Late to rehearsal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penalty Type *</Label>
                    <Select
                      value={newRule.penaltyType}
                      onChange={(e) => setNewRule({ ...newRule, penaltyType: e.target.value })}
                    >
                      {Object.entries(PENALTY_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Amount (ZMW) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newRule.amount}
                        onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (min)</Label>
                      <Input
                        type="number"
                        value={newRule.gracePeriodMin}
                        onChange={(e) => setNewRule({ ...newRule, gracePeriodMin: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newRule.description}
                      onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                      placeholder="Rule description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addRule} disabled={addingRule || !newRule.name || !newRule.amount}>
                    {addingRule ? <Spinner className="mr-2" /> : null}
                    Add Rule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rulesLoading ? (
            <Spinner className="py-4" />
          ) : rulesData?.rules && rulesData.rules.length > 0 ? (
            <div className="space-y-2">
              {rulesData.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rule.name}</p>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {PENALTY_TYPE_LABELS[rule.penaltyType] || rule.penaltyType}
                      {rule.gracePeriodMin > 0 && ` | Grace: ${rule.gracePeriodMin} min`}
                    </p>
                    {rule.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold">ZMW {Number(rule.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No penalty rules defined</p>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Choir Sections</CardTitle>
            <Button size="sm" onClick={() => setSectionDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Section
            </Button>
            <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Section</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Section Name *</Label>
                    <Input
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="e.g. Soprano"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addSection} disabled={addingSection || !newSectionName.trim()}>
                    {addingSection ? <Spinner className="mr-2" /> : null}
                    Add Section
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sectionsLoading ? (
            <Spinner className="py-4" />
          ) : sectionsData?.sections && sectionsData.sections.length > 0 ? (
            <div className="space-y-2">
              {sectionsData.sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                >
                  <p className="text-sm font-medium">{section.name}</p>
                  <Badge variant={section.isActive ? "default" : "secondary"}>
                    {section.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No sections defined</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
