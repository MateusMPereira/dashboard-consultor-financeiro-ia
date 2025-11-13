import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

import { Lancamento, TipoLancamento } from "@/types/lancamento";

interface Subcategory {
  id: string;
  nome: string;
  categorias: {
    natureza: "receita" | "despesa" | null;
  } | null;
}

const Lancamentos = () => {
  const { user, loading: authLoading } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<TipoLancamento>('despesa');

  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data_referencia: format(new Date(), "yyyy-MM-dd"),
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

      const categories = categoriesRes.data || [];
      const subcategoriesData = subcategoriesRes.data || [];
      const lancamentosData = lancamentosRes.data || [];

      const joinedSubcategories = subcategoriesData.map(subcat => {
        const parentCat = categories.find(cat => cat.id === subcat.categoria_id);
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

      const lancamentoData = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        data_referencia: formData.data_referencia,
        sub_categoria_id: formData.sub_categoria_id || null,
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
    const lancamentoTipo = lancamento.subcategorias?.categorias?.natureza || 'despesa';
    setTipoFiltro(lancamentoTipo);
    setFormData({
      descricao: lancamento.descricao || "",
      valor: lancamento.valor.toString(),
      data_referencia: lancamento.data_referencia,
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
      sub_categoria_id: "",
    });
  };

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita")
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa")
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const filteredSubcategories = subcategories.filter(sub => sub.categorias?.natureza === tipoFiltro);

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
              setTipoFiltro('despesa');
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
                    <Label>Tipo</Label>
                    <Select
                      value={tipoFiltro}
                      onValueChange={(value: "receita" | "despesa") => {
                        setTipoFiltro(value);
                        setFormData(prev => ({
                          ...prev,
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

                  <div>
                    <Label>Categoria (opcional)</Label>
                    <Select
                      value={formData.sub_categoria_id}
                      onValueChange={(value) => setFormData({ ...formData, sub_categoria_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filteredSubcategories.length === 0 ? "Nenhuma categoria cadastrada" : "Selecione..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubcategories.length === 0 ? (
                          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                            Nenhuma categoria para este tipo.<br />Cadastre na página Categorias.
                          </div>
                        ) : (
                          filteredSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? "text-green-600" : "text-red-600"}`}>
              R$ {(totalReceitas - totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : lancamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lançamento encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {lancamentos.map((lancamento) => (
                <div
                  key={lancamento.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {lancamento.tipo === "receita" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{lancamento.descricao}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "dd/MM/yyyy")}
                      {lancamento.subcategorias && ` • ${lancamento.subcategorias.nome}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-semibold ${
                        lancamento.tipo === "receita" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {lancamento.tipo === "receita" ? "+" : "-"} R${" "}
                      {Number(lancamento.valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(lancamento)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(lancamento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Lancamentos;
