import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'ngx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  form: FormGroup;
  loading = false;
  userId: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: NbToastrService,
    private usersService: UsersService
  ) {
    this.form = this.fb.group({
      name: [''],
      email: [''],
      role: [''],
    });
  }

  ngOnInit() {
    alert('fetchUserFields');

    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser();
    }
  }

  loadUser() {
    this.loading = true;
    this.usersService.getUser(this.userId).subscribe(
      (data) => {
        this.form.patchValue(data);
        this.loading = false;
      },
      (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
      }
    );
  }

  onSubmit() {
    // if (this.form.valid) {
    //   this.loading = true;
    //   this.usersService.updateUser(this.userId, this.form.value).subscribe(
    //     () => {
    //       this.router.navigate(['/pages/users']);
    //       this.loading = false;
    //     },
    //     (error) => {
    //       console.error('Error updating user:', error);
    //       this.loading = false;
    //     }
    //   );
    // }
  }

  onCancel() {
    this.router.navigate(['/pages/users']);
  }
} 