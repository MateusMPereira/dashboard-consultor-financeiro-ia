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

import { Lancamento, TipoLancamento, NaturezaLancamento, ClassificacaoLancamento, StatusLancamento } from "@/types/lancamento";

interface Category {
  id: string;
  nome: string;
  tipo: string;
}

interface Supplier {
  id: string;
  nome: string;
}

const Lancamentos = () => {
  const {user, authUser} = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);

  const [formData, setFormData] = useState({
    tipo: "despesa" as TipoLancamento,
    natureza: "operacional" as NaturezaLancamento,
    classificacao: "variavel" as ClassificacaoLancamento,
    descricao: "",
    valor: "",
    valor_liquido: "",
    impostos: "",
    data_referencia: format(new Date(), "yyyy-MM-dd"),
    data_vencimento: format(new Date(), "yyyy-MM-dd"),
    data_pagamento: "",
    status: "pendente" as "pendente" | "pago" | "atrasado" | "cancelado",
    forma_pagamento: "",
    parcelas: "1",
    categoria_id: "",
    fornecedor_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");

      const [lancamentosRes, categoriesRes, suppliersRes] = await Promise.all([
        supabase
          .from("lancamentos")
          .select("*, categorias(nome), fornecedores(nome)")
          .filter("empresa_id", "eq", user.empresa_id)
          .order("data_referencia", { ascending: false }),
        supabase.from("categorias").select("*"),
        supabase.from("fornecedores").select("*"),
      ]);

      if (lancamentosRes.error) throw lancamentosRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (suppliersRes.error) throw suppliersRes.error;

      const lancamentosData: Lancamento[] = (lancamentosRes.data || []).map(item => {
        const tipedItem = item as any;
        return {
          id: tipedItem.id,
          usuario_id: tipedItem.usuario_id,
          empresa_id: tipedItem.empresa_id,
          categoria_id: tipedItem.categoria_id,
          fornecedor_id: tipedItem.fornecedor_id,
          tipo: (tipedItem.tipo || "despesa") as TipoLancamento,
          natureza: tipedItem.natureza as NaturezaLancamento || null,
          classificacao: tipedItem.classificacao as ClassificacaoLancamento || null,
          descricao: tipedItem.descricao,
          valor: Number(tipedItem.valor),
          valor_liquido: tipedItem.valor_liquido ? Number(tipedItem.valor_liquido) : null,
          impostos: tipedItem.impostos ? Number(tipedItem.impostos) : null,
          data_referencia: tipedItem.data_referencia,
          data_vencimento: tipedItem.data_vencimento || null,
          data_pagamento: tipedItem.data_pagamento || null,
          status: (tipedItem.status || "pendente") as StatusLancamento,
          forma_pagamento: tipedItem.forma_pagamento || null,
          parcelas: tipedItem.parcelas ? Number(tipedItem.parcelas) : null,
          parcela_atual: tipedItem.parcela_atual ? Number(tipedItem.parcela_atual) : null,
          origem: tipedItem.origem,
          criado_por: tipedItem.criado_por,
          created_at: tipedItem.created_at,
          updated_at: tipedItem.updated_at,
          categorias: tipedItem.categorias,
          fornecedores: tipedItem.fornecedores
        };
      });

      setLancamentos(lancamentosData);
      setCategories(categoriesRes.data || []);
      setSuppliers(suppliersRes.data || []);
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
        tipo: formData.tipo,
        natureza: formData.natureza,
        classificacao: formData.classificacao,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        valor_liquido: formData.valor_liquido ? parseFloat(formData.valor_liquido) : null,
        impostos: formData.impostos ? parseFloat(formData.impostos) : null,
        data_referencia: formData.data_referencia,
        data_vencimento: formData.data_vencimento || null,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
        forma_pagamento: formData.forma_pagamento || null,
        parcelas: formData.parcelas ? parseInt(formData.parcelas) : 1,
        parcela_atual: 1,
        categoria_id: formData.categoria_id || null,
        fornecedor_id: formData.fornecedor_id || null,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        origem: "web",
        criado_por: authUser.email,
      };

      if (editingLancamento) {
        const { error } = await supabase
          .from("lancamentos")
          .update(lancamentoData)
          .eq("id", editingLancamento.id);

        if (error) throw error;
        toast.success("Lançamento atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("lancamentos").insert(lancamentoData);

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
    setFormData({
      tipo: lancamento.tipo,
      natureza: lancamento.natureza || "operacional",
      classificacao: lancamento.classificacao || "variavel",
      descricao: lancamento.descricao || "",
      valor: lancamento.valor.toString(),
      valor_liquido: lancamento.valor_liquido?.toString() || "",
      impostos: lancamento.impostos?.toString() || "",
      data_referencia: lancamento.data_referencia,
      data_vencimento: lancamento.data_vencimento || format(new Date(), "yyyy-MM-dd"),
      data_pagamento: lancamento.data_pagamento || "",
      status: lancamento.status as "pendente" | "pago" | "atrasado" | "cancelado" || "pendente",
      forma_pagamento: lancamento.forma_pagamento || "",
      parcelas: lancamento.parcelas?.toString() || "1",
      categoria_id: lancamento.categoria_id || "",
      fornecedor_id: lancamento.fornecedor_id || "",
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
      tipo: "despesa",
      natureza: "operacional",
      classificacao: "variavel",
      descricao: "",
      valor: "",
      valor_liquido: "",
      impostos: "",
      data_referencia: format(new Date(), "yyyy-MM-dd"),
      data_vencimento: format(new Date(), "yyyy-MM-dd"),
      data_pagamento: "",
      status: "pendente",
      forma_pagamento: "",
      parcelas: "1",
      categoria_id: "",
      fornecedor_id: "",
    });
  };

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita")
    .reduce((sum, l) => sum + Number(l.valor), 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa")
    .reduce((sum, l) => sum + Number(l.valor), 0);

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
            <Button>
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
                                    value={formData.tipo}
                                    onValueChange={(value: "receita" | "despesa") =>
                                      setFormData({ ...formData, tipo: value })
                                    }
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
                                  <Label>Natureza</Label>
                                  <Select
                                    value={formData.natureza}
                                    onValueChange={(value: "operacional" | "financeira" | "investimento") =>
                                      setFormData({ ...formData, natureza: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="operacional">Operacional</SelectItem>
                                      <SelectItem value="financeira">Financeira</SelectItem>
                                      <SelectItem value="investimento">Investimento</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
              
                                <div className="md:col-span-2">
                                  <Label>Descrição</Label>
                                  <Textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    required
                                  />
                                </div>
              
                                <div>
                                  <Label>Classificação</Label>
                                  <Select
                                    value={formData.classificacao}
                                    onValueChange={(value: "fixa" | "variavel") =>
                                      setFormData({ ...formData, classificacao: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="fixa">Fixa</SelectItem>
                                      <SelectItem value="variavel">Variável</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
              
                                <div>
                                  <Label>Valor Bruto (R$)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    required
                                  />
                                </div>
              
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <Label>Data de Vencimento</Label>
                                    <Input
                                      type="date"
                                      value={formData.data_vencimento}
                                      onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Data de Pagamento</Label>
                                    <Input
                                      type="date"
                                      value={formData.data_pagamento}
                                      onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                                    />
                                  </div>
                                </div>
              
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label>Status</Label>
                                    <Select
                                      value={formData.status}
                                      onValueChange={(value: "pendente" | "pago" | "atrasado" | "cancelado") =>
                                        setFormData({ ...formData, status: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pendente">Pendente</SelectItem>
                                        <SelectItem value="pago">Pago</SelectItem>
                                        <SelectItem value="atrasado">Atrasado</SelectItem>
                                        <SelectItem value="cancelado">Cancelado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Forma de Pagamento</Label>
                                    <Input
                                      value={formData.forma_pagamento}
                                      onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label>Número de Parcelas</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={formData.parcelas}
                                      onChange={(e) => setFormData({ ...formData, parcelas: e.target.value })}
                                    />
                                  </div>
                                </div>
              
                                <div>
                                  <Label>Categoria (opcional)</Label>
                                  <Select
                                    value={formData.categoria_id}
                                    onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={categories.length === 0 ? "Nenhuma categoria cadastrada" : "Selecione..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.length === 0 ? (
                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                          Nenhuma categoria cadastrada.<br />Cadastre na página Categorias.
                                        </div>
                                      ) : (
                                        categories.map((cat) => (
                                          <SelectItem key={cat.id} value={cat.id}>
                                            {cat.nome}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
              
                                <div>
                                  <Label>Fornecedor (opcional)</Label>
                                  <Select
                                    value={formData.fornecedor_id}
                                    onValueChange={(value) => setFormData({ ...formData, fornecedor_id: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={suppliers.length === 0 ? "Nenhum fornecedor cadastrado" : "Selecione..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {suppliers.length === 0 ? (
                                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                          Nenhum fornecedor cadastrado.<br />Cadastre na página Fornecedores.
                                        </div>
                                      ) : (
                                        suppliers.map((sup) => (
                                          <SelectItem key={sup.id} value={sup.id}>
                                            {sup.nome}
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
                      {format(new Date(lancamento.data_referencia), "dd/MM/yyyy")}
                      {lancamento.categorias && ` • ${lancamento.categorias.nome}`}
                      {lancamento.fornecedores && ` • ${lancamento.fornecedores.nome}`}
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
