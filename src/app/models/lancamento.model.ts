export interface Lancamento {
    id?: number;
    descricao: string;
    valor: number;
    data: Date | string;
    tipo: 'RECEITA' | 'DESPESA';
    categoriaId?: number;
    numeroParcelas?: number;
    parcelaAtual?: number;
    lancamentoPaiId?: number;
}

