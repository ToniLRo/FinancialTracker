import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  // Notificaciones de Pagos/Transacciones
  showTransactionSuccess(amount: number, type: string) {
    const message = type === 'DEPOSIT' 
      ? `Ingreso registrado: +$${amount}`
      : `Gasto registrado: -$${amount}`;
    this.toastr.success(message, 'Transacción Exitosa');
  }

  // Notificaciones de Cuentas/Wallets
  showAccountBalanceWarning(accountName: string, balance: number) {
    this.toastr.warning(
      `La cuenta ${accountName} tiene un saldo bajo: $${balance}`,
      'Saldo Bajo'
    );
  }

  // Notificaciones de Reportes
  showReportSent(type: string) {
    this.toastr.success(
      `El reporte ${type} ha sido enviado a tu correo`,
      'Reporte Enviado'
    );
  }

  // Notificaciones de Sistema
  showError(message: string) {
    this.toastr.error(message, 'Error');
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Éxito');
  }

  showInfo(message: string) {
    this.toastr.info(message, 'Información');
  }
}
