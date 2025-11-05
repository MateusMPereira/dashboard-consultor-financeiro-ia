import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Natureza {
  id: string;
  descricao: string | null;
  tipo: "receita" | "despesa" | null;
}

interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  empresa_id: string;
  usuario_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  natureza_id: string;
  naturezas: {
    tipo: "receita" | "despesa" | null;
    descricao: string | null;
  } | null;
}

const Categorias = () => {
  const {user, loading: authLoading} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [naturezas, setNaturezas] = useState<Natureza[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    natureza_id: "",
    descricao: "",
  });

  useEffect(() => {
    if (!authLoading && user?.empresa_id) {
      fetchNaturezas();
      fetchCategories();
    }
  }, [authLoading, user?.empresa_id]);

  const fetchNaturezas = async () => {
    try {
      const { data, error } = await supabase
        .from("naturezas")
        .select("id, descricao, tipo");

      if (error) throw error;
      setNaturezas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar naturezas: " + error.message);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (!user?.empresa_id) {
        throw new Error("Empresa não encontrada");
      }

      const { data, error } = await supabase
        .from("categorias")
        .select("*, naturezas(tipo, descricao)")
        .filter("ativo", "eq", true)
        .filter("empresa_id", "eq", user.empresa_id)
        .order("nome");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar categorias: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      natureza_id: "",
      descricao: "",
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");
      if (!formData.natureza_id) {
        toast.error("Por favor, selecione uma natureza.");
        return;
      }

      const categoryData = {
        nome: formData.nome,
        natureza_id: formData.natureza_id,
        descricao: formData.descricao || null,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        ativo: true,
      };

      if (editingCategory) {
        const { error } = await supabase
          .from("categorias")
          .update(categoryData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("categorias")
          .insert(categoryData);

        if (error) throw error;
        toast.success("Categoria cadastrada com sucesso!");
      }

      setIsOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error("Erro ao salvar categoria: " + error.message);
    }
  };

  const handleEdit = (category: Categoria) => {
    setEditingCategory(category);
    setFormData({
        nome: category.nome,
        natureza_id: category.natureza_id,
        descricao: category.descricao || "",
      });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Categoria removida com sucesso!");
      fetchCategories();
    } catch (error: any) {
      toast.error("Erro ao excluir categoria: " + error.message);
    }
  };

  const incomeCategories = categories.filter(c => c.naturezas?.tipo === "receita");
  const expenseCategories = categories.filter(c => c.naturezas?.tipo === "despesa");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus lançamentos financeiros por categorias
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Atualize as informações da categoria"
                  : "Preencha os dados da nova categoria"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Categoria *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Alimentação, Salário"
                />
              </div>
              
              <div>
                <Label htmlFor="natureza">Natureza *</Label>
                <Select
                  value={formData.natureza_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, natureza_id: value })
                  }
                >
                  <SelectTrigger id="natureza">
                    <SelectValue placeholder="Selecione a natureza" />
                  </SelectTrigger>
                  <SelectContent>
                    {naturezas.map((natureza) => (
                      <SelectItem key={natureza.id} value={natureza.id}>
                        <div className="flex items-center gap-2">
                          {natureza.tipo === 'receita' ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                          {natureza.descricao}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da categoria (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Receitas
            </CardTitle>
            <CardDescription>
              {incomeCategories.length === 0
                ? "Nenhuma categoria de receita cadastrada"
                : `${incomeCategories.length} categoria(s) de receita`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria de receita
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{category.nome}</p>
                        {category.descricao && (
                          <p className="text-xs text-muted-foreground">
                            {category.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Despesas
            </CardTitle>
            <CardDescription>
              {expenseCategories.length === 0
                ? "Nenhuma categoria de despesa cadastrada"
                : `${expenseCategories.length} categoria(s) de despesa`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria de despesa
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{category.nome}</p>
                        {category.descricao && (
                          <p className="text-xs text-muted-foreground">
                            {category.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Categorias;
