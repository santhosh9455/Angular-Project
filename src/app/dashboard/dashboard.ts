import { Component, inject, NgModule, OnInit, ViewChild } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from "../components/toast/toast";
import { SidebarComponent } from '../components/sidebar/sidebar';
import { FormControl, FormGroup, FormsModule, NgForm, NgModel } from '@angular/forms';
import Swal from 'sweetalert2';
import { from, Subject } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { debounceTime, switchMap } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule, ToastComponent, SidebarComponent, FormsModule, BaseChartDirective,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule, NgSelectModule, MatAutocompleteModule, MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})


export class Dashboard implements OnInit {



  constructor(private route: ActivatedRoute, private toast: ToastService) {

  }
  // Chart.js related properties
  departmentLabels: string[] = [];
  studentCounts: number[] = [];
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Student Count',
      data: [],
      backgroundColor: []
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#333',
          font: { size: 14, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: '📊 Students per Department',
        color: '#2c3e50',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Segoe UI'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: '#2c3e50',
        titleColor: '#fff',
        bodyColor: '#eee',
        cornerRadius: 6,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#555',
          font: { size: 12 }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#555',
          font: { size: 12 },
          stepSize: 1
        },
        grid: {
          color: '#e0e0e0'
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };


  sidebarCollapsed: boolean = false;



  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  sectionChange: any;

  userRoles: string[] = [];
  username: string = 'Guest';
  viewSection: string | null = null;


  // Student role states
  studentProfile: any;
  // Staff role states
  pendingStudents: any[] = [];
  approvedStudents: any[] = [];
  rejectedStudents: any[] = [];
  subjectStudents: any[] = [];
  staffInfo: any = null;
  allStudents: any[] = [];

  courseList: any[] = [];
  departmentInfo: any = null;

  // HOD role states
  courseId: number | null = null;
  hodRequested: any[] = [];
  hodApproved: any[] = [];
  hodRejected: any[] = [];
  hodSubjects: any[] = [];
  hodStaff: any[] = [];
  hodCourses: any[] = [];
  newStaff = {
    name: '',
    age: null,
    gender: '',
    email: '',
    phoneNumber: '',
    subjectId: null,
    courseName: null
  };

  selectedStaff: any = null;
  updatedStaff: any = {
    name: '',
    email: '',
    age: '',
    gender: '',
    phoneNumber: '',
    subjectNme: '',
    courseName: ''
  };
  selectedStudentId: number | null = null;
  selectedStudent: any = null;
  studentEdit: {
    status: string;
    subjectId: number | null;
    courseId: number | null;
    departmentId: number | null;
    courseStatus: string;
    name: string;
    age: number | null;
    gender: string;
    email: string;
    phoneNumber: string;
    profileImage: File | null;
    marksheetImage: File | null;
    username: string;
  } = {
      name: '',
      age: null,
      gender: '',
      email: '',
      phoneNumber: '',
      profileImage: null,
      marksheetImage: null,
      status: '',
      subjectId: null,
      courseId: null,
      departmentId: null,
      courseStatus: '',
      username: ''
    };


  selectedSubjectId: number | null = null;
  newSubjectName: string = '';
  updatedSubjectName: string = '';
  newCourseName: string = ''

  studentMessage: string = '';

  //Admin role states
  newUserPro = {
    name: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    roleId: null,
    departmentId: null,
    subjectId: null,
    courseId: null,
  };
  newUser = { username: '', password: '', roleId: null };
  allUsers: any[] = [];
  roles: any[] = [];
  UsersProfile: any[] = [];
  roleAssign = { username: '', userId: null };
  roleAssignStud = { username: '', studId: null };
  assignSubject = { departmentId: null, subjectId: null };
  adminUserId?: number;
  editUser: any = {
    id: null,
    username: '',
    password: '',
    roleId: null
  };
  courses: any[] = [];
  studentsCount: number | null = null;
  adminUsername?: string;
  selectedUserProfile: any = null;
  selectedUserId: number | null = null;
  departments: any[] = []; // Load from backend
  subjects: any[] = []; // Load from backend

  // Show success message after staff creation
  showSwal(typeIcon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success', title: string, text: string = '') {
    Swal.fire({
      title: title,
      text: text,
      icon: typeIcon,
      confirmButtonText: 'OK'
    });
  }
  // Confirm action for student approval/rejection
  confirmCourseEnroll(courseId: number) {
    Swal.fire({
      title: 'Enroll this Course?',
      text: 'Are you sure you want to enroll this course?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, enroll it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.registerCourse(courseId);
      }
    });
  }
  deleteStudentSwal(studentId: number) {
    Swal.fire({
      title: 'Delete this student?',
      text: 'Are you sure you want to delete this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteStudent(studentId);
      }
    });
  }


  deleteUserAuthSwal(userAuthId: number) {
    Swal.fire({
      title: 'Delete this user?',
      text: 'Are you sure you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUserAuth(userAuthId);
      }
    });
  }
  deleteUserSwal(userId: number) {
    Swal.fire({
      title: 'Delete this user?',
      text: 'Are you sure you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(userId);
      }
    });
  }

  confirmStudentAction(studentId: number, action: 'approve' | 'reject' | 'approveByStaff' | 'rejectByStaff' | 'deleteCourse') {
    const actionText = action === 'approve' ? 'Approve' : 'Reject';
    const confirmText = action === 'approve' ? 'Yes, approve it!' : 'Yes, reject it!';


    Swal.fire({
      title: `${actionText} this student?`,
      text: `Are you sure you want to ${actionText.toLowerCase()} this student?`,
      icon: action === 'approve' ? 'success' : 'question',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        if (action === 'approve') {
          this.approveHodStudent(studentId);
        } else if (action === 'reject') {
          this.rejectHodStudent(studentId);
        }
        else if (action === 'approveByStaff') {
          this.approveStudentByStaff(studentId);
        }
        else if (action === 'rejectByStaff') {
          this.rejectStudentByStaff(studentId);
        }
      }
    });
  }

  // Chart bar Data loading from back end
  loadChartData() {
    this.http.get<any[]>('http://localhost:8080/admin/gellAllStud', this.authService.getAuthHeaders())
      .subscribe((students) => {
        const departmentMap = new Map<string, number>();

        students.forEach(s => {
          departmentMap.set(s.departmentName, (departmentMap.get(s.departmentName) || 0) + 1);
        });

        this.departmentLabels = Array.from(departmentMap.keys());
        this.studentCounts = Array.from(departmentMap.values());

        const colors = this.generateColors(this.departmentLabels.length);

        this.barChartData = {
          labels: this.departmentLabels,
          datasets: [{
            label: 'Student Count',
            data: this.studentCounts,
            backgroundColor: colors
          }]
        };
      });
  }

  // Color generation for chart
  generateColors(count: number): string[] {
    const palette = [
      '#6a1b9a', '#1e88e5', '#43a047', '#fbc02d', '#e53935',
      '#00838f', '#8e24aa', '#f4511e', '#3949ab', '#00acc1'
    ];
    const colors: string[] = [];

    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }

    return colors;
  }


  // Init the method

  ngOnInit() {
    this.userRoles = this.authService.getUserRole();
    console.log('User Roles:', this.userRoles);
    this.fetchAdminDepartments();


    if (this.hasRole("ROLE_ADMIN")) {
      this.viewSection = 'dashboard';
      this.loadChartData();
      this.fetchUserList();
      this.fetchUserProfiles();
      this.loadAllStudents();

    }

    if (this.hasRole("ROLE_HOD")) {
      this.viewSection = 'hodRequested';
      this.fetchRequestedStudents();
    }
    const name = this.authService.getUsername();
    if (name) {
      this.username = name.toUpperCase();
    }

    if (this.hasRole("ROLE_STAFF")) {
      this.viewSection = 'pending'
      this.fetchCourseStudents();
    }

    if (this.hasRole("ROLE_STUDENT")) {
      this.viewSection = 'profile'
      this.fetchStudentProfile();
    }
    console.log('Logged in as:', this.username);
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }


  //  // Trigger data loading only when shown
  toggleSection(section: string) {
    this.viewSection = this.viewSection === section ? null : section;


    // For student API's

    if (this.viewSection === 'profile' && !this.studentProfile) {
      this.fetchStudentProfile();
    } else if (this.viewSection === 'courses' && this.courseList.length === 0) {
      this.onCourseFilterChange();
    } else if (this.viewSection === 'department' && !this.departmentInfo) {
      this.loadDepartmentInfo();
    }

    // For Staff API's
    if (this.viewSection === 'pending') {
      this.fetchCourseStudents();
    }
    else if (this.viewSection === 'rejected') {
      this.fetchRejectedStudent();
    }
    else if (this.viewSection === 'approved') {
      this.fetchApprovedStudent();
    }
    else if (this.viewSection === 'subjectStudents') {
      this.fetchSubjectStudents();
    } else if (this.viewSection === 'staffInfo') {
      this.fetchStaffInfo();
    } else if (this.viewSection === 'allStudents') {
      this.fetchAllStudents();
    }

    // Hod API's
    else if (this.viewSection === 'hodRequested') {
      this.fetchRequestedStudents();
    } else if (this.viewSection === 'hodApproved') {
      this.fetchHodApproved();
    } else if (this.viewSection === 'hodRejected') {
      this.fetchHodRejected();
    } else if (this.viewSection === 'hodSubjects') {
      this.fetchHodSubjects();
    } else if (this.viewSection === 'hodStaff') {
      this.fetchHodToStaff();

    } else if (this.viewSection === 'hodCourses') {
      this.fetchHodFilterCourses();
    }
    else if (this.viewSection === 'hodCreateStaff') {
      this.fetchHodCourses();
      this.fetchHodSubjects();
    }
    //Admin API's
    else if (this.viewSection === 'adminAllUsers') {
      this.fetchAllAuthUser();
      this.fetchAllUsers();
    }
    else if (this.viewSection === 'adminAllStudents') {
      this.fetchStudents();
      this.onSubjectSearch();
      this.loadAllStudents();
    }
    else if (this.viewSection === 'adminCreateHod') {
      this.fetchAdminDepartments();
    }
    else if (this.viewSection === 'adminCreateUser') {
      this.fetchRoles();
    }
    else if (this.viewSection === 'adminAssignRole') {
    }
    else if (this.viewSection === 'adminAssignSubject') {
      this.fetchAdminDepartments();
      this.fetchSubjects();
    }
    else if (this.viewSection === 'adminAllStaffHod') {
      this.fetchAdminDepartments();
      this.fetchRoles();
      this.fetchUsers();
    }
  }


  // Staff API's
  fetchApprovedStudent() {
    this.http.get<any>('http://localhost:8080/staff/getApprovedStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.approvedStudents = res;
          console.log(this.approvedStudents);
        },
        error: (err: any) => {
          console.error('Student List error:', err);
          this.studentMessage = 'Failed to load Student List.';
        }
      });
  }
  fetchRejectedStudent() {
    this.http.get<any>('http://localhost:8080/staff/getRejectedStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.rejectedStudents = res;
          console.log(this.rejectedStudents);
        },
        error: (err: any) => {
          console.error('Student List error:', err);
          this.studentMessage = 'Failed to load Student List.';
        }
      });

  }
  fetchPenddingStudent() {
    this.http.get<any>('http://localhost:8080/staff/getRequestedStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.pendingStudents = res;
          console.log(this.pendingStudents);
          this.fetchApprovedStudent();
        },
        error: (err: any) => {
          const errorMessage = err?.error?.message || 'Something went wrong';
          console.error('Student List error:', errorMessage);

          this.showSwal('warning', 'Fetch Failed', errorMessage);
          this.studentMessage = errorMessage;
        }
      });
  }


  // Approve student
  approveStudentByStaff(studentId: number) {
    const student = this.pendingStudents.find(s => s.id === studentId);

    if (student?.status === 'APPROVED') {
      console.error('STUDENT ALREADY APPROVED');
      this.toast.showError('Student already approved.');
      return;
    }

    console.log("Approving student ID:", studentId);

    this.http.post(`http://localhost:8080/staff/approveStudent/${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: (response: any) => {
          console.log('Approval API response:', response);

          try {
            this.fetchPenddingStudent();
            this.fetchApprovedStudent();
            this.toast.showSuccess('Student Approved...');
          } catch (err) {
            console.error('Error after approval success:', err);
            this.toast.showError('Student approved, but failed to refresh data.');
          }
        },
        error: (err) => {
          console.error('Approval failed:', err);
          this.toast.showError('Approval failed: Due to some server error');
        }
      });
  }


  // Reject student
  rejectStudentByStaff(studentId: number) {
    if (this.pendingStudents.find(student => student.id === studentId)?.status === 'REJECTED') {
      console.error('STUDENT ALREADY APPROVED');
      this.toast.showError('Student already approved.');
      return;
    }
    this.http.post(`http://localhost:8080/staff/RejectStudent/${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.fetchPenddingStudent();
          this.fetchRejectedStudent();
          this.toast.showSuccess("Student Rejected...")
        },
        error: (err) => {
          console.error('Rejection failed:', err)
          this.toast.showError("Rejection fail due to server error")
        }
      });
  }

  fetchSubjectStudents() {
    this.http.get<any[]>('http://localhost:8080/staff/getSubjectStudents', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.subjectStudents = res,
        error: err => this.toast.showError('Failed to load subject students.')
      });
  }

  fetchStaffInfo() {
    this.http.get<any>('http://localhost:8080/staff/getStaff', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.staffInfo = res,
        error: err => this.toast.showError('Failed to load staff profile.')
      });
  }

  fetchAllStudents() {
    this.http.get<any[]>('http://localhost:8080/staff/getAlltudent', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.allStudents = res,
        error: err => this.toast.showError('Failed to load all students.')
      });
  }


  // Filtering
  studentSearch: string = '';
  studentStatusFilter: string = '';

  // Pagination
  studentPage: number = 0;
  studentSize: number = 5;
  studentTotalPages: number = 0;


  onCourseStudentFilterChange(): void {
    this.studentPage = 0;
    this.fetchCourseStudents();
  }

  onCourseStudentPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.studentTotalPages) {
      this.studentPage = newPage;
      this.fetchCourseStudents();
    }
  }

  fetchCourseStudents(): void {
    const params = {
      name: this.studentSearch,
      courseStatus: this.studentStatusFilter,
      page: this.studentPage,
      size: this.studentSize
    };

    console.log('Fetching course students with params:', params);
    this.http.get<any>('http://localhost:8080/staff/getCourseFilerStud', { params }).subscribe({
      next: (res) => {
        this.pendingStudents = res.students;
        this.studentTotalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error fetching pending students:', err);
      }
    });
  }


  // Filter & Pagination Variables
  subjectStudentFilterName: string = '';
  subjectStudentPage: number = 0;
  subjectStudentSize: number = 5;
  subjectStudentTotalPages: number = 0;

  onSubjectStudentFilterChange(): void {
    this.subjectStudentPage = 0;
    this.fetchFilerSubjectStudents();
  }

  onSubjectStudentPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.subjectStudentTotalPages) {
      this.subjectStudentPage = newPage;
      this.fetchFilerSubjectStudents();
    }
  }

  fetchFilerSubjectStudents(): void {
    const params = {
      name: this.subjectStudentFilterName,
      page: this.subjectStudentPage,
      size: this.subjectStudentSize
    };

    this.http.get<any>('http://localhost:8080/staff/getFilterSubjectStudents', { params }).subscribe({
      next: (res) => {
        this.subjectStudents = res.students;
        this.subjectStudentTotalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error fetching subject students:', err);
      }
    });
  }


  //---------------------------------------------------Staff Completed---------------------------------------------------------------//

  // HOD get APIs------>

  fetchHodRequested() {
    this.http.get<any[]>('http://localhost:8080/hod/requested/studentList', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.hodRequested = res,
        error: err => this.toast.showError('Failed to load requested students.')
      });
  }

  fetchHodApproved() {
    this.http.get<any[]>('http://localhost:8080/hod/approved/studentList', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.hodApproved = res,
        error: err => this.toast.showError('Failed to load approved students.')
      });
  }

  fetchHodRejected() {
    this.http.get<any[]>('http://localhost:8080/hod/rejected/studentList', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.hodRejected = res,
        error: err => this.toast.showError('Failed to load rejected students.')
      });
  }

  fetchHodSubjects() {
    this.http.get<any[]>('http://localhost:8080/hod/getAllSubject', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.hodSubjects = res;
          console.log('HOD Subjects:', this.hodSubjects);
        },
        error: (err: any) => {
          console.error('HOD Subjects error:', err);
          this.studentMessage = 'Failed to load HOD Subjects.';
        }
      });
  }

  fetchHodToStaff() {
    this.http.get<any[]>('http://localhost:8080/hod/getAllStaff', this.authService.getAuthHeaders())
      .subscribe({
        next: res => {
          this.hodStaff = res;
          this.fetchHodCourses();
          this.fetchHodSubjects();
        },
        error: err => this.toast.showError('Failed to load staff list.')
      });
  }

  fetchHodCourses() {
    this.http.get<any[]>('http://localhost:8080/hod/getAllCourse', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.hodCourses = res,
        error: err => this.toast.showError('Failed to load course list.')
      });
  }

  approveHodStudent(studentId: number) {
    if (this.hodRequested.find(student => student.id === studentId)?.status === 'APPROVED') {
      console.error('STUDENT ALREADY APPROVED');
      this.toast.showError('Student already approved.');
      return;
    }
    this.http.post(`http://localhost:8080/hod/approve/student${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.toast.showSuccess('Student approved.');
          this.fetchFilterCourses();
        },
        error: (err) => {
          console.error('Approval failed:', err);
          const errorMessage = err?.error?.message || 'Something went wrong';
          this.toast.showError('Failed to approve student.', errorMessage);
        }
      });
  }

  rejectHodStudent(studentId: number) {
    if (this.hodRequested.find(student => student.id === studentId)?.status === 'REJECTED') {
      console.error('sTUDENT ALREADY REJECTED');
      this.toast.showError('Student already rejected.');
      return;
    }
    this.http.post(`http://localhost:8080/hod/reject/student${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.toast.showSuccess('Student rejected.');
          this.fetchFilterCourses();
        },
        error: (err) => {
          console.error('Rejection failed:', err);
          const errorMessage = err?.error?.message || 'Something went wrong';
          this.toast.showError('Failed to reject student.', errorMessage);
        }
      });
  }

  // HOD CRUD API Methods

  submitCreateStaff() {
    this.http.post('http://localhost:8080/hod/createStaff', this.newStaff, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.newStaff = {
            name: '',
            age: null,
            gender: '',
            email: '',
            phoneNumber: '',
            subjectId: null,
            courseName: null
          };
          this.fetchHodToStaff(); // Assuming this method reloads the staff list
          this.showSwal('success', "Staff Created Successfully", "success"); // Show success message
          const modal = new bootstrap.Modal(document.getElementById('addStaffModal'));
          modal?.hide();
        },
        error: (err) => {
          console.error('Create staff error:', err);
          const errorMessage = err?.error?.message || 'Something went wrong';
          this.showSwal('error', "Failed to create staff", errorMessage); // Show error message
          const modal = new bootstrap.Modal(document.getElementById('addStaffModal'));
          modal?.hide();
        }
      });
  }

  submitCreateSubject() {
    const params = new HttpParams().set('subjectName', this.newSubjectName);
    this.http.post('http://localhost:8080/hod/createSubject', null, {
      headers: this.authService.getAuthHeaders().headers,
      params
    }).subscribe(() => {
      this.showSwal('success', 'Subject Created Successfully', 'success');
      this.newSubjectName = '';
      this.fetchHodSubjects();
      // Close modal after successful creation
      const modalEl = document.getElementById('addSubjectModal');
      if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();  // close modal properly
      }
    });
  }

  NewCourseName!: string | '';

  OpenNewCourseModal() {

    console.log('Adding course:', this.NewCourseName);

    this.NewCourseName = this.NewCourseName;
    const modal = document.getElementById('addCourseModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  submitCreateCourse() {
    if (!this.NewCourseName || !this.NewCourseName.trim()) {
      this.showSwal('warning', 'Course name is required', 'warning');
      return;
    }

    const params = new HttpParams().set('courseName', this.NewCourseName.trim());

    this.http.post('http://localhost:8080/hod/createCourse', null, {
      headers: this.authService.getAuthHeaders().headers,
      params
    }).subscribe({
      next: () => {
        this.showSwal('success', 'Course Created Successfully', 'success');
        this.NewCourseName = '';
        this.fetchHodFilterCourses();

        // Close modal after successful creation
        const modalEl = document.getElementById('addCourseModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance?.hide();  // close modal properly
        }
      },
      error: (err) => {
        console.error('Error creating course:', err);
        this.showSwal('error', 'Creation Failed', err.error?.message || 'Something went wrong');
      }
    });
  }



  openSubjectEditModal(subjectId: number, currentName: string) {
    this.selectedSubjectId = subjectId;
    this.updatedSubjectName = currentName;

    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('editSubjectModal')
    );
    modal.show();
  }

  closeSubjectEditModal() {
    const modal = (window as any).bootstrap.Modal.getInstance(
      document.getElementById('editSubjectModal')
    );
    modal.hide();
  }



  UpdateHodSubject() {
    if (!this.selectedSubjectId || !this.updatedSubjectName.trim()) {
      this.toast.showError('Subject name cannot be empty.');
      return;
    }

    const params = new HttpParams().set('newSubjectName', this.updatedSubjectName.trim());

    this.http.patch(`http://localhost:8080/hod/updateSubject/${this.selectedSubjectId}`, null, {
      headers: this.authService.getAuthHeaders().headers,
      params
    }).subscribe({
      next: () => {
        this.toast.showSuccess('Subject updated successfully!');
        this.fetchHodSubjects();
        this.closeSubjectEditModal(); // close Bootstrap modal after success
      },
      error: (err) => {
        console.error('Subject update error:', err);
        this.toast.showError('Failed to update subject.');
      }
    });
  }

  openUpdateStaffModal(staff: any) {
    this.selectedStaff = staff;
    this.updatedStaff = { ...staff };  // clone current values into the form

    const modalElement = document.getElementById('editStaffModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      this.fetchCourses();
      this.fetchHodSubjects();
      modal.show();
    } else {
      console.error('Staff modal element not found');
    }
  }

  saveUpdatedStaff() {
    if (!this.selectedStaff?.id) return;

    this.http.patch(`http://localhost:8080/hod/staffUpdate/${this.selectedStaff.id}`, this.updatedStaff, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.toast.showSuccess('Staff updated successfully');
          this.fetchHodToStaff(); // refresh list
          this.selectedStaff = null;

          const modal = bootstrap.Modal.getInstance(document.getElementById('editStaffModal'));
          modal?.hide();
        },
        error: (err) => {
          console.error('Staff update failed:', err);
          this.showSwal('error', 'Failed to update staff', err.message || 'Unknown error');
        }
      });
  }

  //  Filter & Pagination Variables
  courseSearch: string = '';
  coursePage: number = 0;
  courseSize: number = 8;
  courseTotalPages: number = 0;


  //  Called on filter input
  onCourseFilterChange(): void {
    this.coursePage = 0;
    this.fetchFilterCourses();
    this.fetchHodFilterCourses();
  }

  //  Called on pagination click
  onCoursePageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.courseTotalPages) {
      this.coursePage = newPage;
      this.fetchFilterCourses();
      this.fetchHodFilterCourses();
    }
  }

  //  Fetch data from API
  fetchFilterCourses(): void {
    const params = {
      search: this.courseSearch,
      page: this.coursePage,
      size: this.courseSize
    };

    this.http.get<any>('http://localhost:8080/api/students/filteredCourses', { params }).subscribe({
      next: (res) => {
        this.courseList = res.courses;
        this.courseTotalPages = res.totalPages;
        console.log('Fetched courses:', this.courseList);

      },
      error: (err) => {
        console.error('Error fetching course list:', err);
      }
    });
  }


  openEditStudentModal(student: any) {

    this.onSubjectSearch();
    console.log('Editing student:', student); // Debug log

    if (!student || !student.id) {
      this.toast.showError('Invalid student selected.');
      return;
    }

    

    this.selectedStudentId = student.id;
    this.studentEdit = {
      status: student.status || '',
      subjectId: student.subjectId || null,
      courseId: student.courseId || null,
      departmentId: student.departmentId || null,
      courseStatus: student.courseStatus || null,
      name: student.name || '',
      age: student.age || null,
      gender: student.gender || '',
      email: '',
      phoneNumber: student.phoneNumber || '',
      profileImage: student.profileImage || null,
      marksheetImage: student.marksheetImage || null,
      username: '',
    };

    console.log('Student edit data:', this.studentEdit); // Debug log

    const modalElement = document.getElementById('editStudentModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      this.onSubjectSearch();
      this.fetchHodCourses(); // Load courses for dropdown      
      modal.show();
    }
  }

  openEditUserModel(user: any) {
    this.fetchRoles();
    if (!user || !user.id) {
      this.toast.showError('Invalid user selected.');
      return;
    }
    this.selectedUserId = user.id;
    this.editUser = {
      id: user.id || null,
      username: user.username || '',
      password: '',
      roleid: user.roleId || null

    };
    const modalUser = document.getElementById('editUserModal');
    if (modalUser) {
      const modal = new bootstrap.Modal(modalUser);
      modal.show();
    }
  }

  departmentId: number | null = null;
  fetchSubjects() {
    const params = {
      page: this.page.toString(),     // Make sure `this.page` exists
      Subjectsize: 100,     // Make sure `this.size` exists
      search: this.searchText || '',      // Optional: if you use filtering
      deptId: this.departmentId?.toString() || ''  // Optional: if department filter is used
    };

    this.http.get<any>('http://localhost:8080/admin/getAllNewFilterSubject', {
      params,
      headers: this.authService.getAuthHeaders().headers
    }).subscribe(
      (response) => {
        this.subjects = response.content;       // actual data
        this.totalElements = response.totalElements; // for pagination controls
        this.page = response.number;            // current page
        this.size = response.size;              // current page size
        console.log('Subjects', this.subjects);
      },
      () => this.toast.showError('Failed to load subjects')
    );
  }

  fetchAdminDepartments() {
    this.http.get<any[]>('http://localhost:8080/dept/AllDept')
      .subscribe({
        next: (data) => this.departments = data,
        error: () => this.toast.showError('Failed to load departments')
      });
  }

  fetchRoles() {
    this.http.get<any[]>('http://localhost:8080/admin/getRoles')
      .subscribe({
        next: (data) => {
          this.roles = data;
        },
        error: (err) => {
          this.toast.showError("Error in loading Roles")
        }
      });
  }


  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.studentEdit.profileImage = file;
      console.log('Profile image selected:', file.name);
    }
  }

  onMarksheetImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.studentEdit.marksheetImage = file;
      console.log('Marksheet image selected:', file.name);
    }
  }



  submitUpdateStudent() {
    if (!this.selectedStudentId) {
      this.toast.showError('No student selected for update.');
      return;
    }

    const formData = new FormData();

    // Append only fields that are present and non-empty
    if (this.studentEdit.name) formData.append('name', this.studentEdit.name);
    if (this.studentEdit.age) formData.append('age', this.studentEdit.age.toString());
    if (this.studentEdit.gender) formData.append('gender', this.studentEdit.gender);
    if (this.studentEdit.email) formData.append('email', this.studentEdit.email);
    if (this.studentEdit.phoneNumber) formData.append('phoneNumber', this.studentEdit.phoneNumber);
    if (this.studentEdit.courseId) formData.append('courseId', this.studentEdit.courseId.toString());
    if (this.studentEdit.departmentId) formData.append('departmentId', this.studentEdit.departmentId.toString());
    if (this.studentEdit.subjectId) formData.append('studentSubject', this.studentEdit.subjectId.toString());
    if (this.studentEdit.status) formData.append('status', this.studentEdit.status);
    if (this.studentEdit.courseStatus) formData.append('courseStatus', this.studentEdit.courseStatus.toString());
    if (this.studentEdit.profileImage) formData.append('profileImage', this.studentEdit.profileImage);
    if (this.studentEdit.marksheetImage) formData.append('marksheetImage', this.studentEdit.marksheetImage);

    this.http.patch(
      `http://localhost:8080/hod/UpdateStudents/${this.selectedStudentId}`,
      formData,
      { headers: this.authService.getAuthHeaders().headers }
    ).subscribe({
      next: () => {
        this.showSwal('success', 'Student Updated', 'Student details updated successfully!');
        this.fetchRequestedStudents();
        const modalEl = document.getElementById('editStudentModal');
        if (modalEl) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
      },
      error: (err) => {
        console.error('Update student error:', err);
        this.toast.showError('Failed to update student');
      }
    });
  }


  handleFileChange(event: any, field: 'profileImage' | 'marksheetImage') {
    const file = event.target.files[0];
    if (file) {
      this.studentEdit[field] = file;
    }
  }

  deleteSubjectModal(id: number) {
    Swal.fire({
      title: 'Delete this Subject?',
      text: 'Are you sure you want to delete this Subject?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteSubject(id);
      }
    });
  }

  deleteSubject(id: number) {
    this.http.delete(`http://localhost:8080/hod/deleteSubject/${id}`, this.authService.getAuthHeaders())
      .subscribe(() => {
        this.showSwal('success', 'Subject Deleted', 'Subject deleted successfully!');
        this.fetchHodSubjects();
      });
  }

  deleteStaff(id: number) {
    this.http.delete(`http://localhost:8080/hod/deleteStaff/${id}`, this.authService.getAuthHeaders())
      .subscribe(() => {
        this.toast.showSuccess('Staff deleted');
        this.fetchHodToStaff();
      });
  }

  deleteCourseSwal(courseId: number) {
    Swal.fire({
      title: 'Delete this Course?',
      text: 'Are you sure you want to delete this Course?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCourse(courseId);
      }
    });
  }

  deleteCourse(id: number) {
    this.http.delete(`http://localhost:8080/hod/deleteCourse/${id}`, this.authService.getAuthHeaders())
      .subscribe(() => {
        this.showSwal('success', 'Course Deleted', 'Course deleted successfully!');
        this.fetchHodFilterCourses();
      });
  }


  selectedCourse: any = {
    id: null,
    CourseName: '',
    staffName: ''
  };


  openUpdateCourseModal(course: any): void {
    this.selectedCourse = {
      id: course.id,
      courseName: course.courseName || null,
      staffName: course.staffName || null,
    };
    const modal = new bootstrap.Modal(document.getElementById('updateCourseModal')!);
    modal.show();
  }

  submitUpdatedCourse(): void {
    if (!this.selectedCourse.id) {
      alert('Course ID is missing');
      return;
    }

    // Ensure trimming and validation
    this.selectedCourse.courseName = this.selectedCourse.courseName?.trim() || null;
    this.selectedCourse.staffName = this.selectedCourse.staffName?.trim() || null;

    console.log('Updating course:', this.selectedCourse);


    this.http.patch('http://localhost:8080/hod/updateCourse', this.selectedCourse).subscribe({
      next: () => {
        this.showSwal('success', 'Updated', 'Course updated successfully!');
        this.fetchHodFilterCourses(); // Refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateCourseModal')!);
        modal?.hide();
      },
      error: (err) => {
        console.error('Update error:', err);
        this.showSwal('error', 'Error', err.error?.message || 'Something went wrong');
        const modal = bootstrap.Modal.getInstance(document.getElementById('updateCourseModal')!);
        modal?.hide();
      }
    });
  }
  filterName: string = '';
  requestedPage: number = 0;
  requestedSize: number = 10;
  requestedTotalPages: number = 0;

  onRequestedFilterChange(): void {
    this.requestedPage = 0;
    this.fetchRequestedStudents();
  }

  onRequestedPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.requestedTotalPages) {
      this.requestedPage = newPage;
      this.fetchRequestedStudents();
    }
  }

  fetchRequestedStudents(): void {
    const params = {
      name: this.filterName,
      status: this.filterStatus,
      page: this.requestedPage,
      size: this.requestedSize
    };

    this.http.get<any>('http://localhost:8080/hod/Allrequested/studentList', { params }).subscribe({
      next: (response) => {
        this.hodRequested = response.students;
        this.requestedTotalPages = response.totalPages;
      },
      error: (err) => {
        console.error('Error fetching requested students:', err);
      }
    });
  }


  openHodStudentDeleteModel(studentId: number) {
    Swal.fire({
      title: 'Delete this Student?',
      text: 'Are you sure you want to delete this Student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.HoddeleteStudent(studentId);
      }
    });
  }

  HoddeleteStudent(studentId: number) {
    this.http.delete(`http://localhost:8080/admin/deleteStudent/${studentId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Student deleted successfully.', 'success');
        this.fetchAllStudents(); // Refresh the student list
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to delete student', 'error');
      }
    });
  }

  selectedStaffId: number | null = null;

  deleteStuffModel(staff: any) {
    Swal.fire({
      title: 'Delete this Staff?',
      text: 'Are you sure you want to delete this Staff?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteStaffByHod(staff);
      }
    });
  }
  deleteStaffByHod(staff: any) {
    this.selectedStaffId = staff.id;

    this.http.delete(`http://localhost:8080/admin/deleteStaff/${this.selectedStaffId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Staff deleted successfully', 'success')
      },
      error: (err) => {
        Swal.fire('Warning', err.error.message, 'error');
      }
    })

  }

  openAddStaffModal() {
    const modal = new bootstrap.Modal(document.getElementById('addStaffModal'));
    modal.show();
  }

  resetStaffForm() {
    this.newStaff = {
      name: '',
      age: null,
      gender: '',
      email: '',
      phoneNumber: '',
      subjectId: null,
      courseName: null
    };
    this.updatedStaff = {};
  }

  @ViewChild('staffForm') staffForm!: NgForm;




  openViewStaffModal(staff: any): void {
    this.selectedStaff = staff;
    const modal = new bootstrap.Modal(document.getElementById('viewStaffModal')!);
    modal.show();
  }




  fetchHodFilterCourses(): void {
    const params = {
      search: this.courseSearch,
      page: this.coursePage,
      size: this.courseSize
    };

    this.http.get<any>('http://localhost:8080/hod/filteredCourse', { params }).subscribe({
      next: (res) => {
        this.courseList = res.courses;
        this.courseTotalPages = res.totalPages;
        console.log(this.courseList);

      },
      error: (err) => {
        console.error('Error fetching course list:', err);
      }
    });
  }


  openAddSubjectModal(): void {
    this.newSubjectName = '';
    const modal = document.getElementById('addSubjectModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  //----------------------------------------------------HOD Completed--------------------------------------------------------//
  //Student API's
  fetchStudentProfile() {
    this.http.get<any>('http://localhost:8080/api/students/getStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.studentProfile = res;
          this.studentMessage = '';
        },
        error: (err: any) => {
          console.error('Profile error:', err);
          this.studentMessage = 'Failed to load profile.';
        }
      });
  }

  fetchCourses() {
    this.http.get<any[]>('http://localhost:8080/api/students/courseList', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any[]) => {
          this.courseList = res;
          this.studentMessage = '';
        },
        error: (err: any) => {
          console.error('Course error:', err);
          this.studentMessage = 'Could not fetch course list.';
        }
      });
  }

  registerCourse(courseId: number) {
    this.http.get<any>('http://localhost:8080/api/students/getStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (studentProfile) => {
          if (studentProfile && (studentProfile.courseStatus === "APPROVED" || studentProfile.courseStatus === "PENDING")) {
            this.showSwal('warning', 'Warning', 'You have already requested this course');
            return;
          }
          this.http.post(`http://localhost:8080/api/students/registerCourse/${courseId}`, {}, {
            headers: {
              Authorization: `Bearer ${this.authService.getToken()}`
            }
          }).subscribe({
            next: () => {
              this.toast.showSuccess('Your course registration was successful.')
            },
            error: (err) => {
              console.error('Enrollment failed:', err);
              this.toast.showError('Your course registration enrollment was failed.')
            }
          });
        },
        error: (err) => {
          console.error('Failed to fetch student profile:', err);
          this.toast.showError('Could not verify course status.');
        }
      });
  }

  loadDepartmentInfo() {
    this.http.get<any>('http://localhost:8080/api/students/departmentInfo', {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (res) => {
        this.departmentInfo = res;
      },
      error: (err) => {
        console.error('Failed to load department info:', err);
      }
    });
  }


  onStudCourseFilterChange(): void {
    this.coursePage = 0;
    this.fetchCourseList();
  }

  onStudCoursePageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.courseTotalPages) {
      this.coursePage = newPage;
      this.fetchCourseList();
    }
  }

  fetchCourseList(): void {
    const params = {
      search: this.courseSearch,
      page: this.coursePage,
      size: this.courseSize
    };

    this.http.get<any>('http://localhost:8080/api/students/courseList', { params }).subscribe({
      next: (res) => {
        this.courseList = res;
        this.courseTotalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error fetching course list:', err);
      }
    });
  }

  //--------------------------------------Student Completed------------------------------------------------------------------//

  //Admin Api's



  loadAllStudents() {
    this.http.get<any[]>('http://localhost:8080/admin/gellAllStud', {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (res: any[]) => {
        this.allStudents = res;
      },
      error: (err) => {
        console.error('Failed to load students:', err);
      }
    });
  }
  viewStudentProfile(student: any): void {
    if (!student) return;

    this.selectedStudent = student;

    // Show modal (using Bootstrap 5 modal JS API)
    const modalEl = document.getElementById('viewStudentModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
  viewUsersProfile(user: any): void {
    if (!user) return;

    this.selectedUserProfile = user;

    // Show modal (using Bootstrap 5 modal JS API)
    const modalEl = document.getElementById('viewUserProModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  AdminsubmitUpdateStudent() {
    if (!this.selectedStudentId) {
      this.toast.showError('No student selected for update.');
      return;
    }

    const formData = new FormData();

    // Append only fields that are present and non-empty
    if (this.studentEdit.name) formData.append('name', this.studentEdit.name);
    if (this.studentEdit.age) formData.append('age', this.studentEdit.age.toString());
    if (this.studentEdit.gender) formData.append('gender', this.studentEdit.gender);
    if (this.studentEdit.email) formData.append('email', this.studentEdit.email);
    if (this.studentEdit.phoneNumber) formData.append('phoneNumber', this.studentEdit.phoneNumber);
    if (this.studentEdit.courseId) formData.append('courseId', this.studentEdit.courseId.toString());
    if (this.studentEdit.departmentId) formData.append('departmentId', this.studentEdit.departmentId.toString());
    if (this.studentEdit.subjectId) formData.append('studentSubject', this.studentEdit.subjectId.toString());
    if (this.studentEdit.status) formData.append('status', this.studentEdit.status);
    if (this.studentEdit.courseStatus) formData.append('courseStatus', this.studentEdit.courseStatus.toString());
    if (this.studentEdit.profileImage) formData.append('profileImage', this.studentEdit.profileImage);
    if (this.studentEdit.marksheetImage) formData.append('marksheetImage', this.studentEdit.marksheetImage);
    if (this.studentEdit.username) formData.append('username', this.studentEdit.username);
    console.log('Updating student with data:', this.studentEdit)
    this.http.patch(
      `http://localhost:8080/admin/UpdateStudents/${this.selectedStudentId}`,
      formData,
      { headers: this.authService.getAuthHeaders().headers }
    ).subscribe({
      next: () => {
        console.log("Data updated");

        this.showSwal('success', 'Student Updated', 'Student details updated successfully!');
        this.toast.showSuccess('Student updated successfully');
        this.fetchStudents();
        this.loadChartData();
        const modalEl = document.getElementById('editStudentModal');
        if (modalEl) {
          const modalInstance = (window as any).bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }
      },
      error: (err) => {
        console.error('Update student error:', err);
        this.showSwal('error', 'Inavalid Data', err.error.message)
        this.toast.showError('Failed to update student');
      }
    });
  }

  submitUserUpdate() {
    const userId: number = this.editUser.id;

    const updatedUser = {
      username: this.editUser.username,
      password: this.editUser.password,
      roleId: this.editUser.roleId
    };

    console.log('Updating user with data:', updatedUser);

    this.http.patch(`http://localhost:8080/admin/updateUsers/${userId}`, updatedUser).subscribe({
      next: () => {
        Swal.fire('Success', 'User updated successfully', 'success');
        this.fetchAllUsers(); // refresh the table
        bootstrap.Modal.getInstance(document.getElementById('editUserModal'))?.hide();
      },
      error: err => {
        console.error(err);
        Swal.fire('Error', err.error?.message || 'Failed to update user', 'error');
      }
    });
  }

  submitAssignSubject() {
    if (!this.assignSubject.departmentId || !this.assignSubject.subjectId) {
      Swal.fire('Error', 'Please select both department and subject.', 'error');
      return;
    }

    const params = new HttpParams()
      .set('departmentId', this.assignSubject.departmentId)
      .set('subjectId', this.assignSubject.subjectId);

    this.http.post('http://localhost:8080/admin/assign-subject-to-students', null, { params }).subscribe({
      next: (res: any) => {
        Swal.fire('Success', 'Subject successfully assigned to all students in selected department.', 'success');
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Failed to assign subject', 'error');
      }
    });
  }


  submitAssignRole() {
    if (!this.roleAssign.username || !this.roleAssign.userId) {
      Swal.fire('Error', 'Please select both username and role.', 'error');
      return;
    }

    const params = new HttpParams()
      .set('username', this.roleAssign.username)
      .set('targetId', this.roleAssign.userId);

    this.http.post('http://localhost:8080/admin/assignAuthUsers', null, { params }).subscribe({
      next: (res: any) => {
        Swal.fire('Success', 'Role successfully assigned to user.', 'success');
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Failed to assign Role', 'error');
      }
    });
  }

  submitCreateUser() {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.roleId) {
      Swal.fire('Error', 'Please fill in all fields.', 'error');
      return;
    }

    this.http.post('http://localhost:8080/admin/createUsers', this.newUser).subscribe({
      next: (res: any) => {
        this.closeModal('createUserModal', true); // close modal and reset form
        Swal.fire('Success', 'User created successfully.', 'success');
        this.newUser = { username: '', password: '', roleId: null }; // reset form if needed
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Failed to create user', 'error');
      }
    });
  }

  fetchAdminSubjects() {
    this.http.get<any[]>('http://localhost:8080/admin/getAllSubjects', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.hodSubjects = res;
          console.log('HOD Subjects:', this.hodSubjects);
        },
        error: (err: any) => {
          console.error('HOD Subjects error:', err);
          this.studentMessage = 'Failed to load HOD Subjects.';
        }
      });
  }
  submitAssignStud() {
    if (!this.roleAssignStud.username || !this.roleAssignStud.studId) {
      Swal.fire('Error', 'Please select both username and role.', 'error');
      return;
    }

    const params = new HttpParams()
      .set('username', this.roleAssignStud.username)
      .set('studId', this.roleAssignStud.studId);

    console.log(this.roleAssignStud);

    this.http.post('http://localhost:8080/admin/assignAuthStud', null, { params }).subscribe({
      next: (res: any) => {
        Swal.fire('Success', 'Role successfully assigned to student.', 'success');
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Failed to assign Role', 'error');
      }
    });
  }

  subjectSearch: string = '';
  filteredSubjects: any[] = [];
  showSubjectDropdown: boolean = false;

  onSubjectSearch(): void {
    if (this.subjectSearch.trim().length === 0) {
      this.filteredSubjects = [];
      this.showSubjectDropdown = false;
      return;
    }

    this.http.get<any[]>('http://localhost:8080/admin/getFilterAllSubjects', {
      params: { search: this.subjectSearch }
    }).subscribe({
      next: (res) => {
        this.filteredSubjects = res;
        this.showSubjectDropdown = true;
      },
      error: () => {
        this.filteredSubjects = [];
        this.showSubjectDropdown = false;
      }
    });
  }

  selectSubject(subject: any): void {
    this.newUserPro.subjectId = subject.id;
    this.subjectSearch = subject.subjectName;
    this.showSubjectDropdown = false;
  }


  submitCreateUserPro(): void {
    this.http.post('http://localhost:8080/admin/createUserPro', this.newUserPro).subscribe({
      next: () => {
        this.showSwal('success', 'Success', 'User created successfully');
        this.resetNewUser();
        this.closeModal();
        this.fetchUsers();
        this.fetchAllUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.showSwal('error', 'Failed to create user', err.error?.message || 'Unknown error');
      }
    });
  }

  resetNewUser(): void {
    this.newUserPro = {
      name: '',
      email: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
      roleId: null,
      departmentId: null,
      subjectId: null,
      courseId: null,
    };
  }

  closeModal(modalId: string = 'createUserProModal', resetForm: boolean = false): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modalInstance.hide();

      if (resetForm && modalId === 'createUserProModal') {
        this.resetNewUser();
      }
      if (resetForm && modalId === 'editUserProModal') {
      }
      if (resetForm && modalId === 'createUserModal') {
        this.newUser = { username: '', password: '', roleId: null };
      }
    }
  }




  fetchUserProfiles() {
    console.log('fetchUserProfiles called');

    this.http.get<any>('http://localhost:8080/admin/getAllStaffHod', {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (res) => {
        this.UsersProfile = res;
      },
      error: (err) => {
        this.toast.showError('Failed to load users Profile');
        console.error('Failed to load users Profile:', err);
      }
    });
  }

  deleteStudent(studentId: number) {
    this.http.delete(`http://localhost:8080/admin/deleteStudent/${studentId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Student deleted successfully.', 'success');
        this.fetchAllStudents(); // Refresh the student list
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to delete student', 'error');
      }
    });
  }

  deleteUser(userProId: number) {
    this.http.delete(`http://localhost:8080/admin/deleteUserPro/${userProId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'User deleted successfully.', 'success');
        this.fetchUsers(); // Refresh the user list
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to delete user', 'error');
      }
    });
  }

  deleteUserAuth(userId: number) {
    this.http.delete(`http://localhost:8080/admin/deleteUserAuths/${userId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'User authorization deleted successfully.', 'success');
        this.fetchAllUsers(); // Refresh the user list
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Failed to delete user authorization', 'error');
      }
    });
  }

  Courses: any[] = [];
  fetchAdminCourses() {
    this.http.get<any[]>('http://localhost:8080/admin/getAllCourses', this.authService.getAuthHeaders())
      .subscribe({
        next: (res) => {
          this.Courses = res;
          console.log('Admin Courses:', this.Courses); // <-- Moved here
        },
        error: (err) => {
          console.error('Error fetching courses:', err);
          if (err.error.message) {
            this.toast.showError(err.error.message);
          } else {
            this.toast.showError('Failed to load course list.');
          }
        }
      });
  }


  // Filter parameters
  searchText: string = '';
  filterRole: string = '';
  filterStatus = '';
  filterDepartment: number | null = null;
  students: any[] = [];

  // Pagination
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;


  fetchUsers(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());

    if (this.searchText?.trim()) {
      params = params.set('search', this.searchText.trim());
    }

    if (this.filterRole) {
      params = params.set('role', this.filterRole);
    }

    if (this.filterDepartment !== null && this.filterDepartment !== undefined) {
      params = params.set('departmentId', this.filterDepartment.toString());
    }

    console.log("Data   .." + params);

    this.http.get<any>('http://localhost:8080/admin/api/users', { params }).subscribe({
      next: (res) => {
        this.UsersProfile = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  fetchStudents(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());

    if (this.searchText?.trim()) {
      params = params.set('search', this.searchText.trim());
    }

    if (this.filterDepartment !== null) {
      params = params.set('departmentId', this.filterDepartment.toString());
    }

    if (this.filterStatus) {
      params = params.set('status', this.filterStatus);
    }

    console.log("Data   .." + params);

    this.http.get<any>('http://localhost:8080/admin/api/students', { params }).subscribe({
      next: (res) => {
        this.students = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
      }
    });
  }

  onFilterChange(): void {
    this.page = 0;
    this.fetchUsers();
    this.fetchAllAuthUser();
    this.fetchStudents();
  }


  onPageChange(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.fetchStudents();
      this.fetchAllAuthUser();

    }
    this.fetchUsers();
  }


  openCreateUserProModal(): void {
    this.fetchRoles();
    this.fetchAdminDepartments();
    this.fetchSubjects();
    this.fetchAdminCourses()

    // Reset form model
    this.newUserPro = {
      name: '',
      email: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
      roleId: null,
      departmentId: null,
      subjectId: null,
      courseId: null,
    };

    const modalElement = document.getElementById('createUserProModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  editUserPro = {
  id: null as number | null,
  name: '' as string,
  email: '' as string,
  phoneNumber: '' as string,
  gender: '' as string,
  dateOfBirth: '' as string,

  departmentId: null as number | null,
  subjectIds: [] as number[],  // ✅ updated to support multiple
  courseId: null as number | null,
  username: '' as string
};


  openEditUserModal(user: any): void {
    this.fetchAdminCourses();
    this.fetchSubjects();
    this.fetchAdminDepartments();
    this.editUserPro = {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth || '',
      departmentId: user.departmentId || null,
      subjectIds: user.subjectIds || [],
      courseId: user.courseId || null,
      username: ''
    };

    const modalEl = document.getElementById('editUserProModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);

      modal.show();
    }
  }


  updateUserPartial(): void {
    this.http.patch('http://localhost:8080/admin/updateHod', this.editUserPro).subscribe({
      next: () => {
        this.showSwal('success', 'Updated', 'User updated successfully');
        this.closeModal('editUserProModal', true);
        this.fetchUsers();
      },
      error: (err) => {
        this.showSwal('error', 'Update Failed', err.error.message || 'Unknown error');
      }
    });
  }

  userFilterRoleId: number | null = null;

  fetchAllAuthUser(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());
    this.fetchRoles();

    if (this.searchText?.trim()) {
      params = params.set('search', this.searchText.trim());
    }

    if (this.userFilterRoleId != null) {
      params = params.set('roleId', this.userFilterRoleId.toString());
    }

    this.http.get<any>('http://localhost:8080/admin/users', { params }).subscribe({
      next: (res) => {
        this.allUsers = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  openCreateUserModal(): void {
    this.fetchRoles(); // fetch roles to populate dropdown if not already fetched

    // Reset the form model
    this.newUser = {
      username: '',
      password: '',
      roleId: null
    };

    // Show modal
    const modalElement = document.getElementById('createUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  newStudent: {
    name: string;
    age: number | null;
    gender: string;
    email: string;
    phoneNumber: string;
    departmentId: number | null;
    profileImage: File | null;
    marksheetImage: File | null;
  } = {
      name: '',
      age: null,
      gender: '',
      email: '',
      phoneNumber: '',
      departmentId: null,
      profileImage: null,
      marksheetImage: null,
    };

  createStudentModal() {
    this.fetchRoles(); // fetch roles to populate dropdown if not already fetched


    // Show modal
    const modalElement = document.getElementById('createStudentModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onProfileImageSelected2(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.newStudent.profileImage = file;
      console.log('Profile image selected:', file.name);
    }
  }

  onMarksheetImageSelected2(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.newStudent.marksheetImage = file;
      console.log('Marksheet image selected:', file.name);
    }
  }

  AdminSubmitCreateStudent() {
    const formData = new FormData();

    // Required fields
    formData.append('name', this.newStudent.name || '');
    formData.append('age', this.newStudent.age?.toString() || '');
    formData.append('gender', this.newStudent.gender || '');
    formData.append('email', this.newStudent.email || '');
    formData.append('phoneNumber', this.newStudent.phoneNumber || '');
    formData.append('departmentId', this.newStudent.departmentId?.toString() || '');

    // Optional file fields
    if (this.newStudent.profileImage) {
      formData.append('profileImage', this.newStudent.profileImage);
    }

    if (this.newStudent.marksheetImage) {
      formData.append('marksheetImage', this.newStudent.marksheetImage);
    }

    this.http.post(
      'http://localhost:8080/admin/createStudent',
      formData,
      this.authService.getAuthHeaders() // ensure this returns `{ headers: HttpHeaders }`
    ).subscribe({
      next: (res) => {
        this.showSwal('success', 'Success', 'Student created successfully');

        // ✅ Reset form
        this.newStudent = {
          name: '',
          age: null,
          gender: '',
          email: '',
          phoneNumber: '',
          departmentId: null,
          profileImage: null,
          marksheetImage: null
        };
        this.fetchStudents();

        // ✅ Close modal safely
        const modalEl = document.getElementById('createStudentModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance?.hide();
        }
      },
      error: (err) => {
        console.error('Error creating user:', err);
        this.showSwal('error', 'Failed to create student', err.error?.message || 'Unknown error');
      }
    });
  }

  users: any[] = [];
  totalUsers = 0;
  displayedColumns: string[] = ['index', 'username', 'role', 'actions'];

  onUserFilterChange(): void {
    this.page = 0; // Reset to first page
    this.fetchAllUsers();
  }

  onPageEvent(event: PageEvent) {
    this.size = event.pageSize;
    this.page = event.pageIndex;
    this.fetchAllUsers();
  }

  sortField: string = 'username'; // default
  sortDirection: 'asc' | 'desc' = 'asc';

  onSortChange(sort: Sort) {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc'; // fallback to asc
    this.page = 0; // reset to first page on sort
    this.fetchAllUsers(); // your server API should support sorting
    console.log(`Sorting by ${this.sortField} ${this.sortDirection}`);

  }

  fetchAllUsers(): void {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString())
      .set('sort', `${this.sortField},${this.sortDirection}`);

    if (this.searchText?.trim()) {
      params = params.set('search', this.searchText.trim());
    }
    if (this.userFilterRoleId != null) {
      params = params.set('roleId', this.userFilterRoleId.toString());
    }

    this.http.get<any>('http://localhost:8080/admin/users', { params }).subscribe({
      next: (res) => {
        this.allUsers = res.content;
        this.totalPages = res.totalPages;
        this.totalUsers = res.totalElements;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });

  }


  fetchUserList() {
    this.http.get<any>('http://localhost:8080/admin/getAllUsers').subscribe({
      next: (res) => {
        this.allUsers = res;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }
}

