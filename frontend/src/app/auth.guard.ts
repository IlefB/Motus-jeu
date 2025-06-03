import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('user'); // نتحقق إذا يوجد مستخدم مخزن

    if (user) {
      // إذا المستخدم موجود، يسمح بالدخول
      return true;
    } else {
      // إذا لا يوجد مستخدم، يعيد توجيه لصفحة الاتصال
      this.router.navigate(['/connexion']);
      return false;
    }
  }
}
