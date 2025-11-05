import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Toolbar } from 'primeng/toolbar';

@Component({
    selector: 'app-lancamentos-list',
    standalone: true,
    imports: [CommonModule, Button, Toolbar],
    templateUrl: './lancamentos-list.html'
})
export class LancamentosList implements OnInit {
    items: MenuItem[] = [];

    ngOnInit() {
        this.items = [
            {
                icon: 'pi pi-plus',
                label: 'Receita',
                command: () => {
                    // Implementação futura - Adicionar Receita
                }
            },
            {
                icon: 'pi pi-arrow-down',
                label: 'Despesa',
                command: () => {
                    // Implementação futura - Adicionar Despesa
                }
            }
        ];
    }
}
