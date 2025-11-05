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
import { Toolbar } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LancamentoService } from '@/services/lancamento.service';
import { Lancamento } from '@/models/lancamento.model';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

@Component({
    selector: 'app-lancamentos-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, Dialog, Toast, ConfirmDialog, InputTextModule, InputNumberModule, DatePicker, RadioButton, Toolbar, TooltipModule, IconField, InputIcon],
    templateUrl: './lancamentos-list.html',
    providers: [MessageService, ConfirmationService]
})
export class LancamentosList implements OnInit {
    lancamentoService = inject(LancamentoService);
    messageService = inject(MessageService);
    confirmationService = inject(ConfirmationService);

    lancamentos: Lancamento[] = [];
    lancamentoDialog: boolean = false;
    lancamento: Lancamento = {} as Lancamento;
    submitted: boolean = false;
    loading: boolean = false;
    isEditMode: boolean = false;

    ngOnInit() {
        this.loadLancamentos();
    }

    loadLancamentos() {
        this.loading = true;
        this.lancamentoService.getLancamentos().subscribe({
            next: (lancamentos) => {
                this.lancamentos = lancamentos;
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

    openNew() {
        this.lancamento = { valor: 0, data: new Date(), tipo: 'DESPESA' } as Lancamento;
        this.submitted = false;
        this.isEditMode = false;
        this.lancamentoDialog = true;
    }

    editLancamento(lancamento: Lancamento) {
        this.lancamento = {
            ...lancamento,
            data: lancamento.data ? new Date(lancamento.data) : new Date()
        };
        this.isEditMode = true;
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
}
