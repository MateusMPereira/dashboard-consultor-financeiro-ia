import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

import { Lancamento } from "@/types/lancamento";

interface Categoria {
  id: string;
  descricao: string;
  natureza: "receita" | "despesa";
}

interface Subcategory {
  id: string;
  nome: string;
  categoria_id: string;
  categorias: {
    natureza: "receita" | "despesa" | null;
  } | null;
}

const Lancamentos = () => {
  const { user, loading: authLoading } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [naturezaFiltro, setNaturezaFiltro] = useState<'receita' | 'despesa'>('despesa');
  const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('despesa');

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data_referencia: format(new Date(), "yyyy-MM-dd"),
    categoria_id: "",
    sub_categoria_id: "",
  });

  useEffect(() => {
    if (!authLoading && user?.empresa_id) {
      fetchData();
    }
  }, [authLoading, user?.empresa_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user?.empresa_id) {
        throw new Error("Empresa não encontrada");
      }

      const [lancamentosRes, subcategoriesRes, categoriesRes] = await Promise.all([
        supabase
          .from("lancamentos")
          .select("*")
          .eq("empresa_id", user.empresa_id)
          .order("data_referencia", { ascending: false }),
        supabase
          .from("subcategorias")
          .select("*")
          .eq("empresa_id", user.empresa_id)
          .eq("ativo", true),
        supabase.from("categorias").select("*")
      ]);

      if (lancamentosRes.error) throw lancamentosRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const categoriesData = categoriesRes.data || [];
      const subcategoriesData = subcategoriesRes.data || [];
      const lancamentosData = lancamentosRes.data || [];

      setCategories(categoriesData);

      const joinedSubcategories = subcategoriesData.map(subcat => {
        const parentCat = categoriesData.find(cat => cat.id === subcat.categoria_id);
        return {
          ...subcat,
          categorias: parentCat || null
        };
      });
      setSubcategories(joinedSubcategories);

      const joinedLancamentos: Lancamento[] = lancamentosData.map((lancamento: any) => {
        const subcat = joinedSubcategories.find(sc => sc.id === lancamento.sub_categoria_id);
        return {
          ...lancamento,
          subcategorias: subcat,
          tipo: subcat?.categorias?.natureza || 'despesa',
        };
      });

      setLancamentos(joinedLancamentos);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");

      if (!formData.sub_categoria_id) {
        toast.error("Por favor, selecione uma Categoria.");
        return;
      }

      const lancamentoData = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_referencia: formData.data_referencia,
        sub_categoria_id: formData.sub_categoria_id, // No longer optional
        empresa_id: user.empresa_id,
      };

      if (editingLancamento) {
        const { error } = await supabase
          .from("lancamentos")
          .update(lancamentoData)
          .eq("id", editingLancamento.id);

        if (error) throw error;
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("lancamentos").insert([lancamentoData]);

        if (error) throw error;
        toast.success("Lançamento criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar lançamento: " + error.message);
    }
  };

  const handleEdit = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento);
    const lancamentoNatureza = lancamento.subcategorias?.categorias?.natureza || 'despesa';
    setNaturezaFiltro(lancamentoNatureza);
    setFormData({
      descricao: lancamento.descricao || "",
      valor: lancamento.valor.toString(),
      data_referencia: lancamento.data_referencia,
      categoria_id: lancamento.subcategorias?.categoria_id || "",
      sub_categoria_id: lancamento.sub_categoria_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;

    try {
      const { error } = await supabase.from("lancamentos").delete().eq("id", id);

      if (error) throw error;
      toast.success("Lançamento excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir lançamento: " + error.message);
    }
  };

  const resetForm = () => {
    setEditingLancamento(null);
    setFormData({
      descricao: "",
      valor: "",
      data_referencia: format(new Date(), "yyyy-MM-dd"),
      categoria_id: "",
      sub_categoria_id: "",
    });
  };

  // Totals for current month only
  const today = new Date();
  const currentMonthStart = format(startOfMonth(today), "yyyy-MM-dd");
  const currentMonthEnd = format(endOfMonth(today), "yyyy-MM-dd");

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita" && l.data_referencia >= currentMonthStart && l.data_referencia <= currentMonthEnd)
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa" && l.data_referencia >= currentMonthStart && l.data_referencia <= currentMonthEnd)
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const filteredCategories = categories.filter(c => c.natureza === naturezaFiltro);
  const filteredSubcategories = subcategories.filter(sub => sub.categoria_id === formData.categoria_id);

  const incomeLancamentos = lancamentos.filter(l => l.tipo === 'receita');
  const expenseLancamentos = lancamentos.filter(l => l.tipo === 'despesa');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lançamentos Financeiros</h2>
          <p className="text-muted-foreground">Gerencie todas as receitas e despesas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setNaturezaFiltro(activeTab);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingLancamento ? "Editar Lançamento" : "Novo Lançamento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="max-h-[80vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Natureza</Label>
                    <Select
                      value={naturezaFiltro}
                      onValueChange={(value: "receita" | "despesa") => {
                        setNaturezaFiltro(value);
                        setFormData(prev => ({
                          ...prev,
                          categoria_id: "",
                          sub_categoria_id: "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="despesa">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          categoria_id: value,
                          sub_categoria_id: "",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Subcategoria</Label>
                    <Select
                      value={formData.sub_categoria_id}
                      onValueChange={(value) => setFormData({ ...formData, sub_categoria_id: value })}
                      disabled={!formData.categoria_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.categoria_id ? "Selecione uma categoria primeiro" : "Selecione..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Data de Referência</Label>
                    <Input
                      type="date"
                      value={formData.data_referencia}
                      onChange={(e) => setFormData({ ...formData, data_referencia: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margem de Contribuição</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ebitda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {(totalReceitas - totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'receita' | 'despesa')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="despesa">Despesas</TabsTrigger>
          <TabsTrigger value="receita">Receitas</TabsTrigger>
        </TabsList>
        <TabsContent value="despesa">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : expenseLancamentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma despesa encontrada
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseLancamentos.map((lancamento) => (
                        <TableRow key={lancamento.id}>
                          <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                          <TableCell>{lancamento.subcategorias?.nome || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{lancamento.fonte || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">- R$ {Number(lancamento.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(lancamento)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(lancamento.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="receita">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : incomeLancamentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma receita encontrada
                </div>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeLancamentos.map((lancamento) => (
                        <TableRow key={lancamento.id}>
                          <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                          <TableCell>{lancamento.subcategorias?.nome || "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{lancamento.fonte || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">+ R$ {Number(lancamento.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(lancamento)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDelete(lancamento.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lancamentos;
