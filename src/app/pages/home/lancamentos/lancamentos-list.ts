import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { RadioButton } from 'primeng/radiobutton';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LancamentoService } from '@/services/lancamento.service';
import { CategoryService } from '@/services/category.service';
import { Lancamento } from '@/models/lancamento.model';
import { Category } from '@/models/category.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-lancamentos-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, DatePicker, RadioButton, Select, Checkbox, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './lancamentos-list.html',
    providers: [MessageService, ConfirmationService]
})
export class LancamentosList implements OnInit {
    lancamentoService = inject(LancamentoService);
    categoryService = inject(CategoryService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    lancamentos: Lancamento[] = [];
    lancamentosFiltrados: Lancamento[] = [];
    categorias: Category[] = [];
    lancamentoDialog: boolean = false;
    lancamento: Lancamento = {} as Lancamento;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;
    isParcelado: boolean = false;
    numeroParcelas: number = 1;

    // Controle de navegação por mês/ano
    mesAtual: number = new Date().getMonth();
    anoAtual: number = new Date().getFullYear();
    mesSelecionado: number = this.mesAtual;
    anoSelecionado: number = this.anoAtual;

    mesesNomes: string[] = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    ngOnInit() {
        this.loadLancamentos();
        this.loadCategorias();
    }

    loadCategorias() {
        this.categoryService.getCategories().subscribe({
            next: (categorias) => {
                this.categorias = categorias;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar categorias'
                });
            }
        });
    }

    loadLancamentos() {
        this.loading = true;
        this.lancamentoService.getLancamentos().subscribe({
            next: (lancamentos) => {
                this.lancamentos = lancamentos;
                this.filtrarLancamentosPorMesAno();
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao carregar lançamentos'
                });
                this.loading = false;
            }
        });
    }

    filtrarLancamentosPorMesAno() {
        this.lancamentosFiltrados = this.lancamentos.filter(lancamento => {
            const dataLancamento = new Date(lancamento.data);
            return dataLancamento.getMonth() === this.mesSelecionado &&
                   dataLancamento.getFullYear() === this.anoSelecionado;
        });
    }

    mesAnterior() {
        if (this.mesSelecionado === 0) {
            this.mesSelecionado = 11;
            this.anoSelecionado--;
        } else {
            this.mesSelecionado--;
        }
        this.filtrarLancamentosPorMesAno();
    }

    proximoMes() {
        if (this.mesSelecionado === 11) {
            this.mesSelecionado = 0;
            this.anoSelecionado++;
        } else {
            this.mesSelecionado++;
        }
        this.filtrarLancamentosPorMesAno();
    }

    voltarMesAtual() {
        this.mesSelecionado = this.mesAtual;
        this.anoSelecionado = this.anoAtual;
        this.filtrarLancamentosPorMesAno();
    }

    get mesAnoSelecionado(): string {
        return `${this.mesesNomes[this.mesSelecionado]} ${this.anoSelecionado}`;
    }

    get isNoPeriodoAtual(): boolean {
        return this.mesSelecionado === this.mesAtual && this.anoSelecionado === this.anoAtual;
    }

    openNew() {
        this.lancamento = { valor: 0, data: new Date(), tipo: 'DESPESA' } as Lancamento;
        this.submitted = false;
        this.isEditMode = false;
        this.isParcelado = false;
        this.numeroParcelas = 1;
        this.lancamentoDialog = true;
    }

    editLancamento(lancamento: Lancamento) {
        this.lancamento = {
            ...lancamento,
            data: lancamento.data ? new Date(lancamento.data) : new Date()
        };
        this.isEditMode = true;
        this.isParcelado = false;
        this.numeroParcelas = 1;
        this.lancamentoDialog = true;
    }

    hideDialog() {
        this.lancamentoDialog = false;
        this.submitted = false;
    }

    saveLancamento() {
        this.submitted = true;

        if (this.lancamento.descricao?.trim() && this.lancamento.valor !== undefined && this.lancamento.data && this.lancamento.tipo) {
            if (this.lancamento.id) {
                // Update
                this.lancamentoService.updateLancamento(this.lancamento.id, this.lancamento).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: 'Lançamento atualizado com sucesso'
                        });
                        this.loadLancamentos();
                        this.lancamentoDialog = false;
                        this.lancamento = {} as Lancamento;
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: 'Erro ao atualizar lançamento'
                        });
                    }
                });
            } else {
                // Create
                if (this.isParcelado && this.numeroParcelas > 1) {
                    this.criarLancamentosParcelados();
                } else {
                    this.lancamentoService.createLancamento(this.lancamento).subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Sucesso',
                                detail: 'Lançamento criado com sucesso'
                            });
                            this.loadLancamentos();
                            this.lancamentoDialog = false;
                            this.lancamento = {} as Lancamento;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erro',
                                detail: 'Erro ao criar lançamento'
                            });
                        }
                    });
                }
            }
        }
    }

    confirmDelete(lancamento: Lancamento) {
        this.confirmationService.confirm({
            message: `Tem certeza que deseja deletar o lançamento "${lancamento.descricao}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.deleteLancamento(lancamento.id!);
            }
        });
    }

    deleteLancamento(id: number) {
        this.lancamentoService.deleteLancamento(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Lançamento deletado com sucesso'
                });
                this.loadLancamentos();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Erro ao deletar lançamento'
                });
            }
        });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(value: Date | string): string {
        const date = typeof value === 'string' ? new Date(value) : value;
        return new Intl.DateTimeFormat('pt-BR').format(date);
    }

    getCategoriaNome(categoriaId?: number): string {
        if (!categoriaId) return '-';
        const categoria = this.categorias.find(c => c.id === categoriaId);
        return categoria?.nome || '-';
    }

    criarLancamentosParcelados() {
        const valorParcela = this.lancamento.valor / this.numeroParcelas;
        const dataBase = new Date(this.lancamento.data);
        let parcelasRestantes = this.numeroParcelas;
        let parcelasErro = 0;

        for (let i = 0; i < this.numeroParcelas; i++) {
            const dataParcela = new Date(dataBase);
            dataParcela.setDate(dataParcela.getDate() + (i * 30));

            const parcela: Lancamento = {
                ...this.lancamento,
                valor: valorParcela,
                data: dataParcela,
                descricao: `${this.lancamento.descricao} (${i + 1}/${this.numeroParcelas})`,
                numeroParcelas: this.numeroParcelas,
                parcelaAtual: i + 1
            };

            this.lancamentoService.createLancamento(parcela).subscribe({
                next: () => {
                    parcelasRestantes--;
                    if (parcelasRestantes === 0 && parcelasErro === 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sucesso',
                            detail: `${this.numeroParcelas} parcelas criadas com sucesso`
                        });
                        this.loadLancamentos();
                        this.lancamentoDialog = false;
                        this.lancamento = {} as Lancamento;
                    } else if (parcelasRestantes === 0 && parcelasErro > 0) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Parcialmente Concluído',
                            detail: `${this.numeroParcelas - parcelasErro} de ${this.numeroParcelas} parcelas criadas`
                        });
                        this.loadLancamentos();
                        this.lancamentoDialog = false;
                        this.lancamento = {} as Lancamento;
                    }
                },
                error: () => {
                    parcelasRestantes--;
                    parcelasErro++;
                    if (parcelasRestantes === 0) {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erro',
                            detail: `Erro ao criar parcelas. ${parcelasErro} parcela(s) falharam`
                        });
                        if (parcelasErro < this.numeroParcelas) {
                            this.loadLancamentos();
                        }
                    }
                }
            });
        }
    }

    get valorParcela(): number {
        if (!this.isParcelado || this.numeroParcelas <= 1) {
            return this.lancamento.valor || 0;
        }
        return (this.lancamento.valor || 0) / this.numeroParcelas;
    }
}
