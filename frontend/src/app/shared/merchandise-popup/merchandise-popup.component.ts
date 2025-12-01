import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-merchandise-popup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './merchandise-popup.component.html',
    styleUrls: ['./merchandise-popup.component.css']
})
export class MerchandisePopupComponent {
    @Input() merchandising: any[] = [];
    @Input() eventTitle: string = '';
    @Output() productsSelected = new EventEmitter<any[]>();
    @Output() cancelled = new EventEmitter<void>();

    public selectedProducts: Set<string> = new Set();

    public toggleProduct(product: any): void {
        if (this.selectedProducts.has(product.id)) {
            this.selectedProducts.delete(product.id);
        } else {
            this.selectedProducts.add(product.id);
        }
    }

    public isSelected(product: any): boolean {
        return this.selectedProducts.has(product.id);
    }

    public confirmSelection(): void {
        const selected = this.merchandising.filter(p => this.selectedProducts.has(p.id));
        this.productsSelected.emit(selected);
        this.closePopup();
    }

    public skipMerchandise(): void {
        this.cancelled.emit();
        this.closePopup();
    }

    private closePopup(): void {
        this.selectedProducts.clear();
    }
}
