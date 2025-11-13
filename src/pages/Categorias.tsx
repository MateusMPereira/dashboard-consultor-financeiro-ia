import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Represents the parent category (e.g., "Receitas Operacionais", "Custos Fixos")
interface Categoria {
  id: string;
  descricao: string;
  natureza: "receita" | "despesa";
}

// Represents the subcategory, which is what the user manages in this UI
interface Subcategoria {
  id: string;
  nome: string;
  descricao?: string | null;
  empresa_id: string;
  usuario_id?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at?: string | null;
  categoria_id: string;
  categorias: {
    natureza: "receita" | "despesa" | null;
    descricao: string | null;
  } | null;
}

const CategoriasPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategoria | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [naturezaFiltro, setNaturezaFiltro] = useState<'receita' | 'despesa'>('despesa');
  const [formData, setFormData] = useState({
    nome: "",
    categoria_id: "",
    descricao: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");

      // 1. Fetch Categories and Subcategories in parallel
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        supabase.from("categorias").select("id, descricao, natureza"),
        supabase
          .from("subcategorias")
          .select("*")
          .eq("ativo", true)
          .eq("empresa_id", user.empresa_id)
          .order("nome")
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      const categoriesData = categoriesRes.data || [];
      const subcategoriesData = subcategoriesRes.data || [];
      
      setCategories(categoriesData);

      // 2. Manually join subcategories with their parent category
      const joinedSubcategories = subcategoriesData.map(subcat => {
        const parentCat = categoriesData.find(cat => cat.id === subcat.categoria_id);
        return {
          ...subcat,
          categorias: parentCat ? { natureza: parentCat.natureza, descricao: parentCat.descricao } : null
        };
      });
      setSubcategories(joinedSubcategories);

    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.empresa_id) {
      fetchData();
    }
  }, [authLoading, user?.empresa_id]);

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria_id: "",
      descricao: "",
    });
    setEditingSubcategory(null);
    setNaturezaFiltro('despesa');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");
      if (!formData.categoria_id) {
        toast.error("Por favor, selecione uma Categoria.");
        return;
      }

      const subcategoryData = {
        nome: formData.nome,
        categoria_id: formData.categoria_id,
        descricao: formData.descricao || null,
        usuario_id: user.id,
        empresa_id: user.empresa_id,
        ativo: true,
      };

      if (editingSubcategory) {
        const { error } = await supabase
          .from("subcategorias")
          .update(subcategoryData)
          .eq("id", editingSubcategory.id);

        if (error) throw error;
        toast.success("Subcategoria atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("subcategorias")
          .insert(subcategoryData);

        if (error) throw error;
        toast.success("Subcategoria cadastrada com sucesso!");
      }

      setIsOpen(false);
      resetForm();
      fetchData(); // Refetch all data
    } catch (error: any) {
      toast.error("Erro ao salvar subcategoria: " + error.message);
    }
  };

  const handleEdit = (subcategory: Subcategoria) => {
    setEditingSubcategory(subcategory);
    
    const parentCategory = categories.find(c => c.id === subcategory.categoria_id);
    if (parentCategory) {
      setNaturezaFiltro(parentCategory.natureza);
    }

    setFormData({
        nome: subcategory.nome,
        categoria_id: subcategory.categoria_id,
        descricao: subcategory.descricao || "",
      });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta subcategoria?")) return;

    try {
      const { error } = await supabase
        .from("subcategorias")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
      toast.success("Subcategoria removida com sucesso!");
      fetchData(); // Refetch all data
    } catch (error: any) {
      toast.error("Erro ao excluir subcategoria: " + error.message);
    }
  };

  const incomeSubcategories = subcategories.filter(c => c.categorias?.natureza === "receita");
  const expenseSubcategories = subcategories.filter(c => c.categorias?.natureza === "despesa");
  const filteredCategories = categories.filter(c => c.natureza === naturezaFiltro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subcategorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus lançamentos financeiros em subcategorias.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Subcategoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory ? "Editar Subcategoria" : "Nova Subcategoria"}
              </DialogTitle>
              <DialogDescription>
                {editingSubcategory
                  ? "Atualize as informações da subcategoria"
                  : "Preencha os dados da nova subcategoria"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Subcategoria *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  placeholder="Ex: Fornecedor de Carnes, Aluguel"
                />
              </div>

              <div>
                <Label htmlFor="natureza">Natureza *</Label>
                <Select
                  value={naturezaFiltro}
                  onValueChange={(value: 'receita' | 'despesa') => {
                    setNaturezaFiltro(value);
                    setFormData(prev => ({ ...prev, categoria_id: "" }));
                  }}
                >
                  <SelectTrigger id="natureza">
                    <SelectValue placeholder="Selecione a natureza" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        Despesa
                      </div>
                    </SelectItem>
                    <SelectItem value="receita">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Receita
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="categoria_pai">Categoria *</Label>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoria_id: value })
                  }
                >
                  <SelectTrigger id="categoria_pai">
                    <SelectValue placeholder="Selecione a categoria" />
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

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da subcategoria (opcional)"
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
                  {editingSubcategory ? "Atualizar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Subcategories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Subcategorias de Receita
            </CardTitle>
            <CardDescription>
              {incomeSubcategories.length === 0
                ? "Nenhuma subcategoria de receita cadastrada"
                : `${incomeSubcategories.length} subcategoria(s) de receita`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-8">Carregando...</div> : incomeSubcategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma subcategoria de receita
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {incomeSubcategories.map((subcat) => (
                  <div
                    key={subcat.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{subcat.nome}</p>
                        {subcat.descricao && (
                          <p className="text-xs text-muted-foreground">
                            {subcat.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subcat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subcat.id)}
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

        {/* Expense Subcategories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Subcategorias de Despesa
            </CardTitle>
            <CardDescription>
              {expenseSubcategories.length === 0
                ? "Nenhuma subcategoria de despesa cadastrada"
                : `${expenseSubcategories.length} subcategoria(s) de despesa`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-8">Carregando...</div> : expenseSubcategories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma subcategoria de despesa
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {expenseSubcategories.map((subcat) => (
                  <div
                    key={subcat.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{subcat.nome}</p>
                        {subcat.descricao && (
                          <p className="text-xs text-muted-foreground">
                            {subcat.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subcat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subcat.id)}
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

export default CategoriasPage;