import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '@app/core/services/cart.service';
import { OrdersService, CreateOrderData } from '@app/core/services/orders.service';
import { AuthService } from '@app/core/services/auth.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  availableSlots: number;
  maxSlots: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="checkout-page">
      <div class="container">
        @if (cart.isEmpty()) {
          <div class="empty-cart">
            <h1>Tu carrito está vacío</h1>
            <p>Agregá productos antes de continuar al checkout</p>
            <a routerLink="/tienda" class="btn-primary">Ver Productos</a>
          </div>
        } @else {
          <div class="checkout-header">
            <h1>Checkout</h1>
            <div class="steps">
              <span class="step" [class.active]="currentStep() >= 1">1. Datos</span>
              <span class="step" [class.active]="currentStep() >= 2">2. Entrega</span>
              <span class="step" [class.active]="currentStep() >= 3">3. Confirmar</span>
            </div>
          </div>

          <div class="checkout-layout">
            <!-- Form -->
            <div class="checkout-form">
              <form [formGroup]="form" (ngSubmit)="onSubmit()">
                
                <!-- Step 1: Customer Data -->
                @if (currentStep() === 1) {
                  <div class="form-section">
                    <h2>Datos de Contacto</h2>
                    
                    <div class="form-group">
                      <label for="customer_name">Nombre completo *</label>
                      <input 
                        type="text" 
                        id="customer_name" 
                        formControlName="customer_name"
                        class="input"
                        placeholder="Tu nombre"
                        [class.error]="isFieldInvalid('customer_name')"
                      />
                      @if (isFieldInvalid('customer_name')) {
                        <span class="field-error">El nombre es requerido</span>
                      }
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label for="customer_email">Email *</label>
                        <input 
                          type="email" 
                          id="customer_email" 
                          formControlName="customer_email"
                          class="input"
                          placeholder="tu@email.com"
                          [class.error]="isFieldInvalid('customer_email')"
                        />
                        @if (isFieldInvalid('customer_email')) {
                          <span class="field-error">Ingresá un email válido</span>
                        }
                      </div>

                      <div class="form-group">
                        <label for="customer_phone">Teléfono *</label>
                        <input 
                          type="tel" 
                          id="customer_phone" 
                          formControlName="customer_phone"
                          class="input"
                          placeholder="099 123 456"
                          [class.error]="isFieldInvalid('customer_phone')"
                        />
                        @if (isFieldInvalid('customer_phone')) {
                          <span class="field-error">El teléfono es requerido</span>
                        }
                      </div>
                    </div>

                    <div class="form-actions">
                      <a routerLink="/carrito" class="btn-secondary">← Volver al Carrito</a>
                      <button type="button" class="btn-primary" (click)="nextStep()">
                        Continuar →
                      </button>
                    </div>
                  </div>
                }

                <!-- Step 2: Delivery -->
                @if (currentStep() === 2) {
                  <div class="form-section">
                    <h2>Fecha de entrega</h2>
                    <p class="section-desc">Seleccioná un día con disponibilidad (máximo 2 tortas por día)</p>

                    <div class="calendar-block">
                      <div class="calendar-header">
                        <button type="button" class="month-nav" (click)="prevMonth()">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <h3 class="month-title">{{ currentMonthName() }} {{ currentYear() }}</h3>
                        <button type="button" class="month-nav" (click)="nextMonth()">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>
                      <div class="calendar-grid">
                        <div class="weekday">Dom</div>
                        <div class="weekday">Lun</div>
                        <div class="weekday">Mar</div>
                        <div class="weekday">Mié</div>
                        <div class="weekday">Jue</div>
                        <div class="weekday">Vie</div>
                        <div class="weekday">Sáb</div>
                        @for (day of calendarDays(); track day.date.getTime()) {
                          <button
                            type="button"
                            class="calendar-day"
                            [class.other-month]="!day.isCurrentMonth"
                            [class.today]="day.isToday"
                            [class.available]="day.availableSlots === day.maxSlots && day.isCurrentMonth && !day.isPast"
                            [class.limited]="day.availableSlots > 0 && day.availableSlots < day.maxSlots && day.isCurrentMonth && !day.isPast"
                            [class.occupied]="(day.availableSlots === 0 || day.isPast) && day.isCurrentMonth"
                            [class.selected]="day.isSelected"
                            [disabled]="!day.isCurrentMonth || day.availableSlots === 0 || day.isPast"
                            (click)="selectDeliveryDay(day)"
                          >
                            <span class="day-number">{{ day.dayNumber }}</span>
                            @if (day.isCurrentMonth && day.availableSlots >= 0 && !day.isPast) {
                              <span class="slots-badge">{{ day.availableSlots }}/{{ day.maxSlots }}</span>
                            }
                          </button>
                        }
                      </div>
                      @if (form.get('delivery_date')?.value) {
                        <p class="selected-date-label">Fecha elegida: <strong>{{ formatDeliveryDate(form.get('delivery_date')?.value) }}</strong></p>
                      }
                    </div>

                    <h2 class="subsection-title">Método de Entrega</h2>
                    <div class="delivery-options">
                      <label class="delivery-option" [class.selected]="form.get('delivery_type')?.value === 'pickup'">
                        <input 
                          type="radio" 
                          formControlName="delivery_type" 
                          value="pickup"
                        />
                        <div class="option-content">
                          <div class="option-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                              <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          </div>
                          <div class="option-info">
                            <strong>Retiro en Local</strong>
                            <span>Gratis - Coordinamos día y hora</span>
                          </div>
                        </div>
                      </label>

                      <label class="delivery-option" [class.selected]="form.get('delivery_type')?.value === 'delivery'">
                        <input 
                          type="radio" 
                          formControlName="delivery_type" 
                          value="delivery"
                        />
                        <div class="option-content">
                          <div class="option-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                              <path d="M15 18H9"/>
                              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                              <circle cx="17" cy="18" r="2"/>
                              <circle cx="7" cy="18" r="2"/>
                            </svg>
                          </div>
                          <div class="option-info">
                            <strong>Delivery a Domicilio</strong>
                            <span>Montevideo - Costo según zona</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    @if (form.get('delivery_type')?.value === 'delivery') {
                      <div class="delivery-address">
                        <div class="form-group">
                          <label for="delivery_address">Dirección *</label>
                          <input 
                            type="text" 
                            id="delivery_address" 
                            formControlName="delivery_address"
                            class="input"
                            placeholder="Calle, número, apartamento"
                          />
                        </div>

                        <div class="form-row">
                          <div class="form-group">
                            <label for="delivery_city">Ciudad/Barrio *</label>
                            <input 
                              type="text" 
                              id="delivery_city" 
                              formControlName="delivery_city"
                              class="input"
                              placeholder="Ej: Pocitos, Montevideo"
                            />
                          </div>

                          <div class="form-group">
                            <label for="delivery_time_slot">Horario preferido</label>
                            <select id="delivery_time_slot" formControlName="delivery_time_slot" class="input">
                              <option value="">Cualquier horario</option>
                              <option value="09:00-12:00">Mañana (9:00 - 12:00)</option>
                              <option value="12:00-15:00">Mediodía (12:00 - 15:00)</option>
                              <option value="15:00-18:00">Tarde (15:00 - 18:00)</option>
                              <option value="18:00-21:00">Noche (18:00 - 21:00)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    }

                    <div class="form-group">
                      <label for="notes">Notas adicionales</label>
                      <textarea 
                        id="notes" 
                        formControlName="notes"
                        class="input textarea"
                        rows="3"
                        placeholder="Instrucciones especiales, mensajes para la torta, etc."
                      ></textarea>
                    </div>

                    <div class="form-actions">
                      <button type="button" class="btn-secondary" (click)="prevStep()">
                        ← Volver
                      </button>
                      <button type="button" class="btn-primary" (click)="nextStep()">
                        Continuar →
                      </button>
                    </div>
                  </div>
                }

                <!-- Step 3: Confirm -->
                @if (currentStep() === 3) {
                  <div class="form-section">
                    <h2>Confirmar Pedido</h2>

                    <div class="confirmation-summary">
                      <div class="summary-block">
                        <h3>Datos de contacto</h3>
                        <p><strong>{{ form.get('customer_name')?.value }}</strong></p>
                        <p>{{ form.get('customer_email')?.value }}</p>
                        <p>{{ form.get('customer_phone')?.value }}</p>
                      </div>

                      <div class="summary-block">
                        <h3>Entrega</h3>
                        <p><strong>{{ form.get('delivery_type')?.value === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local' }}</strong></p>
                        @if (form.get('delivery_type')?.value === 'delivery') {
                          <p>{{ form.get('delivery_address')?.value }}</p>
                          <p>{{ form.get('delivery_city')?.value }}</p>
                        }
                        <p>Fecha: {{ formatDeliveryDate(form.get('delivery_date')?.value || '') }}</p>
                        @if (form.get('delivery_time_slot')?.value) {
                          <p>Horario: {{ form.get('delivery_time_slot')?.value }}</p>
                        }
                      </div>

                      @if (form.get('notes')?.value) {
                        <div class="summary-block">
                          <h3>Notas</h3>
                          <p>{{ form.get('notes')?.value }}</p>
                        </div>
                      }
                    </div>

                    @if (error()) {
                      <div class="alert alert-error">
                        {{ error() }}
                      </div>
                    }

                    <div class="form-actions">
                      <button type="button" class="btn-secondary" (click)="prevStep()">
                        ← Volver
                      </button>
                      <button type="submit" class="btn-primary btn-confirm" [disabled]="submitting()">
                        @if (submitting()) {
                          <span class="spinner"></span>
                          Procesando...
                        } @else {
                          Confirmar Pedido
                        }
                      </button>
                    </div>
                  </div>
                }
              </form>
            </div>

            <!-- Order Summary Sidebar -->
            <aside class="order-summary">
              <h2>Tu Pedido</h2>
              
              <div class="order-items">
                @for (item of cart.items(); track item.id) {
                  <div class="order-item">
                    <img [src]="item.product.main_image || 'assets/images/placeholder.jpg'" [alt]="item.product.name" />
                    <div class="item-details">
                      <span class="item-name">{{ item.product.name }}</span>
                      @if (item.notes) {
                        <span class="item-notes">{{ item.notes }}</span>
                      }
                      <span class="item-qty">x{{ item.quantity }}</span>
                    </div>
                    <span class="item-price">{{ item.subtotal | currency:'UYU':'$':'1.0-0' }}</span>
                  </div>
                }
              </div>

              <div class="order-totals">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>{{ cart.total() | currency:'UYU':'$':'1.0-0' }}</span>
                </div>
                <div class="total-row">
                  <span>Envío</span>
                  <span>{{ deliveryFee() | currency:'UYU':'$':'1.0-0' }}</span>
                </div>
                <div class="total-row final">
                  <span>Total</span>
                  <span>{{ totalWithDelivery() | currency:'UYU':'$':'1.0-0' }}</span>
                </div>
              </div>

              <div class="secure-checkout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Compra segura - Mercado Pago</span>
              </div>
            </aside>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .checkout-page {
      padding: var(--space-24) 0 var(--space-16);
      background-color: var(--surface);
      min-height: 80vh;
    }

    .empty-cart {
      text-align: center;
      padding: var(--space-16);
      background: white;
      border-radius: var(--radius-xl);

      h1 {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-2);
      }

      p {
        color: var(--ink-light);
        margin-bottom: var(--space-6);
      }

      .btn-primary {
        display: inline-block;
        padding: var(--space-3) var(--space-6);
        background-color: var(--brand);
        color: white;
        border-radius: var(--radius-md);
        font-weight: 600;

        &:hover {
          background-color: var(--brand-dark);
          color: white;
        }
      }
    }

    .checkout-header {
      margin-bottom: var(--space-6);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        margin-bottom: var(--space-4);
      }
    }

    .steps {
      display: flex;
      gap: var(--space-4);

      .step {
        font-size: var(--text-sm);
        color: var(--ink-muted);
        padding-bottom: var(--space-2);
        border-bottom: 2px solid transparent;

        &.active {
          color: var(--brand);
          border-bottom-color: var(--brand);
          font-weight: 600;
        }
      }
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 400px;
      }
    }

    .checkout-form {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
    }

    .form-section {
      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-5);
        padding-bottom: var(--space-3);
        border-bottom: 1px solid #E0D5C8;
      }

      .section-desc {
        font-size: var(--text-sm);
        color: var(--ink-light);
        margin: -var(--space-2) 0 var(--space-4);
      }

      .subsection-title {
        margin-top: var(--space-6);
        padding-top: var(--space-4);
        border-top: 1px solid #E0D5C8;
        font-size: var(--text-lg);
      }
    }

    .calendar-block {
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
    }

    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .month-title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--ink);
      margin: 0;
    }

    .month-nav {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);
      color: var(--ink);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .month-nav:hover {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .weekday {
      text-align: center;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--ink-light);
      padding: var(--space-2) 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      font-size: var(--text-sm);
      font-weight: 600;
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      background: white;
      color: var(--ink);
      cursor: pointer;
      transition: all var(--transition-fast);
      padding: 4px;
    }

    .calendar-day.other-month {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .calendar-day.today {
      border-color: var(--brand);
    }

    .calendar-day.available {
      background: #d1fae5;
      color: #065f46;
    }
    .calendar-day.available .slots-badge { background: #10b981; color: white; }
    .calendar-day.available:hover:not(:disabled) {
      background: #10b981;
      color: white;
    }

    .calendar-day.limited {
      background: #fef3c7;
      color: #92400e;
    }
    .calendar-day.limited .slots-badge { background: #f59e0b; color: white; }
    .calendar-day.limited:hover:not(:disabled) {
      background: #f59e0b;
      color: white;
    }

    .calendar-day.occupied {
      background: #fee2e2;
      color: #991b1b;
      cursor: not-allowed;
    }
    .calendar-day.occupied .slots-badge { background: #ef4444; color: white; }

    .calendar-day.selected {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }
    .calendar-day.selected .slots-badge { background: rgba(255,255,255,0.3); color: white; }

    .calendar-day:disabled { cursor: not-allowed; }

    .day-number { line-height: 1; }
    .slots-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 4px;
      border-radius: 4px;
      line-height: 1;
    }

    .selected-date-label {
      margin: var(--space-3) 0 0;
      font-size: var(--text-sm);
      color: var(--ink);
    }

    .form-group {
      margin-bottom: var(--space-4);

      label {
        display: block;
        font-size: var(--text-sm);
        font-weight: 500;
        margin-bottom: var(--space-2);
      }

      small {
        display: block;
        font-size: var(--text-xs);
        color: var(--ink-muted);
        margin-top: var(--space-1);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-base);
      border: 1px solid #E0D5C8;
      border-radius: var(--radius-md);

      &:focus {
        outline: none;
        border-color: var(--brand);
        box-shadow: 0 0 0 3px rgba(247, 87, 12, 0.1);
      }

      &.error {
        border-color: var(--error);
      }

      &.textarea {
        resize: vertical;
      }
    }

    .field-error {
      display: block;
      font-size: var(--text-xs);
      color: var(--error);
      margin-top: var(--space-1);
    }

    .delivery-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .delivery-option {
      cursor: pointer;

      input {
        display: none;
      }

      .option-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        border: 2px solid #E0D5C8;
        border-radius: var(--radius-lg);
        transition: all var(--transition-fast);
      }

      &.selected .option-content {
        border-color: var(--brand);
        background-color: rgba(247, 87, 12, 0.05);
      }

      &:hover .option-content {
        border-color: var(--brand);
      }
    }

    .option-icon {
      width: 48px;
      height: 48px;
      background: var(--surface);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--brand);
    }

    .option-info {
      strong {
        display: block;
        margin-bottom: 2px;
      }

      span {
        font-size: var(--text-sm);
        color: var(--ink-light);
      }
    }

    .delivery-address {
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
    }

    .confirmation-summary {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .summary-block {
      padding: var(--space-4);
      background: var(--surface);
      border-radius: var(--radius-lg);

      h3 {
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--ink-light);
        margin-bottom: var(--space-2);
      }

      p {
        font-size: var(--text-sm);
        margin-bottom: 2px;
      }
    }

    .alert {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);

      &.alert-error {
        background-color: #FEE2E2;
        color: #DC2626;
        border: 1px solid #FECACA;
      }
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid #E0D5C8;
    }

    .btn-primary, .btn-secondary {
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .btn-primary {
      background-color: var(--brand);
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background-color: var(--brand-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: white;
      color: var(--ink);
      border: 1px solid #E0D5C8;
      text-decoration: none;

      &:hover {
        background: var(--surface);
        color: var(--ink);
      }
    }

    .btn-confirm {
      padding: var(--space-4) var(--space-8);
      font-size: var(--text-base);
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .order-summary {
      background: white;
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      height: fit-content;
      position: sticky;
      top: var(--space-4);

      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--space-4);
      }
    }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid #E0D5C8;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);

      img {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        object-fit: cover;
      }

      .item-details {
        flex: 1;
        min-width: 0;

        .item-name {
          display: block;
          font-size: var(--text-sm);
          font-weight: 500;
        }

        .item-notes {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 10px;
          color: var(--ink-light);
          margin-top: 2px;
          line-height: 1.3;
        }

        .item-qty {
          font-size: var(--text-xs);
          color: var(--ink-light);
        }
      }

      .item-price {
        font-size: var(--text-sm);
        font-weight: 600;
      }
    }

    .order-totals {
      margin-bottom: var(--space-4);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      font-size: var(--text-sm);

      &.final {
        font-size: var(--text-lg);
        font-weight: 700;
        color: var(--ink);
        padding-top: var(--space-3);
        border-top: 1px solid #E0D5C8;
        margin-top: var(--space-2);
      }
    }

    .secure-checkout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--surface);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      color: var(--ink-light);
    }
  `],
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  cart = inject(CartService);
  private ordersService = inject(OrdersService);
  private auth = inject(AuthService);

  currentStep = signal(1);
  submitting = signal(false);
  error = signal<string | null>(null);

  // Calendario de fecha de entrega (paso 2)
  calendarDate = signal(new Date());
  availabilityMap = signal<Record<string, { reserved: number; capacity: number }>>({});
  private readonly maxSlotsPerDay = 2;

  constructor() {
    effect(() => {
      const step = this.currentStep();
      const cal = this.calendarDate();
      if (step === 2) this.loadAvailabilityForMonth(cal);
    });
  }

  form: FormGroup = this.fb.group({
    customer_name: ['', Validators.required],
    customer_email: ['', [Validators.required, Validators.email]],
    customer_phone: ['', Validators.required],
    delivery_type: ['pickup', Validators.required],
    delivery_address: [''],
    delivery_city: [''],
    delivery_date: ['', Validators.required],
    delivery_time_slot: [''],
    notes: [''],
  });

  minDate = this.getMinDate();

  deliveryFee = computed(() => {
    return this.form.get('delivery_type')?.value === 'delivery' ? 150 : 0;
  });

  totalWithDelivery = computed(() => {
    return this.cart.total() + this.deliveryFee();
  });

  ngOnInit() {
    // Pre-fill user data if logged in
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        customer_name: user.full_name,
        customer_email: user.email,
        customer_phone: user.phone || '',
      });
    }
    // Si se viene desde Agenda con ?date=YYYY-MM-DD, ir al paso 2 y preseleccionar la fecha
    this.route.queryParams.subscribe((params) => {
      const dateParam = params['date'];
      if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        this.form.patchValue({ delivery_date: dateParam });
        this.currentStep.set(2);
        const d = new Date(dateParam + 'T12:00:00');
        this.calendarDate.set(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    });
  }

  getMinDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Min 48hs
    return date.toISOString().split('T')[0];
  }

  private getMinDateObj(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  loadAvailabilityForMonth(monthDate: Date): void {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const from = first.toISOString().split('T')[0];
    const to = last.toISOString().split('T')[0];
    this.ordersService.getAvailability(from, to).subscribe({
      next: (res) => this.availabilityMap.set(res.dates || {}),
      error: () => this.availabilityMap.set({}),
    });
  }

  currentMonthName = computed(() => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[this.calendarDate().getMonth()];
  });

  currentYear = computed(() => this.calendarDate().getFullYear());

  calendarDays = computed(() => {
    const date = this.calendarDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const map = this.availabilityMap();
    const minDate = this.getMinDateObj();
    const selectedDateStr = this.form.get('delivery_date')?.value as string | null;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dayDate = new Date(year, month - 1, dayNum);
      days.push({
        date: dayDate,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
        availableSlots: 0,
        maxSlots: this.maxSlotsPerDay,
        isSelected: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = dayDate.toISOString().split('T')[0];
      const isPast = dayDate < minDate;
      const info = map[dateStr];
      const reserved = info?.reserved ?? 0;
      const capacity = info?.capacity ?? this.maxSlotsPerDay;
      const availableSlots = Math.max(0, capacity - reserved);

      days.push({
        date: dayDate,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dayDate.getTime() === today.getTime(),
        isPast,
        availableSlots: isPast ? 0 : availableSlots,
        maxSlots: this.maxSlotsPerDay,
        isSelected: selectedDateStr === dateStr,
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const dayDate = new Date(year, month + 1, day);
      days.push({
        date: dayDate,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
        availableSlots: 0,
        maxSlots: this.maxSlotsPerDay,
        isSelected: false,
      });
    }
    return days;
  });

  prevMonth(): void {
    const current = this.calendarDate();
    this.calendarDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.calendarDate();
    this.calendarDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  selectDeliveryDay(day: CalendarDay): void {
    if (!day.isCurrentMonth || day.availableSlots === 0 || day.isPast) return;
    const dateStr = day.date.toISOString().split('T')[0];
    this.form.patchValue({ delivery_date: dateStr });
  }

  formatDeliveryDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  nextStep() {
    if (this.currentStep() === 1) {
      // Validate step 1
      const step1Fields = ['customer_name', 'customer_email', 'customer_phone'];
      step1Fields.forEach(f => this.form.get(f)?.markAsTouched());
      
      if (step1Fields.every(f => this.form.get(f)?.valid)) {
        this.currentStep.set(2);
      }
    } else if (this.currentStep() === 2) {
      // Validate step 2
      if (!this.form.get('delivery_date')?.value) {
        this.form.get('delivery_date')?.markAsTouched();
        return;
      }
      
      if (this.form.get('delivery_type')?.value === 'delivery') {
        if (!this.form.get('delivery_address')?.value || !this.form.get('delivery_city')?.value) {
          return;
        }
      }
      
      this.currentStep.set(3);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onSubmit() {
    if (this.form.invalid || this.cart.isEmpty()) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const orderData: CreateOrderData = {
      customer_name: this.form.value.customer_name,
      customer_email: this.form.value.customer_email,
      customer_phone: this.form.value.customer_phone,
      delivery_type: this.form.value.delivery_type,
      delivery_address: this.form.value.delivery_address || undefined,
      delivery_city: this.form.value.delivery_city || undefined,
      delivery_date: this.form.value.delivery_date || undefined,
      delivery_time_slot: this.form.value.delivery_time_slot || undefined,
      notes: this.form.value.notes || undefined,
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (order) => {
        this.cart.clearCart();
        this.router.navigate(['/checkout/success'], {
          queryParams: { order: order.order_number },
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.detail || 'Error al crear el pedido. Intentá de nuevo.');
      },
    });
  }
}
