import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from "../components/toast/toast";
import { SidebarComponent } from '../components/sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { from } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ActivatedRoute } from '@angular/router';


declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule, ToastComponent, SidebarComponent, FormsModule, BaseChartDirective],
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
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Students per Department'
      }
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
    courseName: ''
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
    active: string;
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
  } = {
      name: '',
      age: null,
      gender: '',
      email: '',
      phoneNumber: '',
      profileImage: null,
      marksheetImage: null,
      active: '',
      subjectId: null,
      courseId: null,
      departmentId: null,
      courseStatus: '',
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
    role: '',
    departmentId: null,
    subjectId: null,
    courseId: null
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
      confirmButtonText: 'Cool'
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

  confirmStudentAction(studentId: number, action: 'approve' | 'reject' | 'approveByStaff' | 'rejectByStaff') {
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
    this.fetchUsers();

    this.viewSection = 'dashboard';
    if (this.hasRole("ROLE_ADMIN")) {
      this.loadChartData();
      this.fetchUserProfiles();
      this.fetchAllUsers();
      this.loadAllStudents();

    }

    const name = this.authService.getUsername();
    if (name) {
      this.username = name.toUpperCase();
    }

    console.log('Logged in as:', this.username);
    if (this.hasRole('ROLE_STAFF')) {
      this.fetchPenddingStudent();
      console.log('Staff role matched. Staff dashboard will be visible.');
    }
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
      this.fetchCourses();
    } else if (this.viewSection === 'department' && !this.departmentInfo) {
      this.loadDepartmentInfo();
    }

    // For Staff API's
    if (this.viewSection === 'pending') {
      this.fetchPenddingStudent();
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
      this.fetchHodRequested();
    } else if (this.viewSection === 'hodApproved') {
      this.fetchHodApproved();
    } else if (this.viewSection === 'hodRejected') {
      this.fetchHodRejected();
    } else if (this.viewSection === 'hodSubjects') {
      this.fetchHodSubjects();
    } else if (this.viewSection === 'hodStaff') {
      this.fetchHodToStaff();

    } else if (this.viewSection === 'hodCourses') {
      this.fetchHodCourses();
    }
    else if (this.viewSection === 'hodCreateStaff') {
      this.fetchHodCourses();
      this.fetchHodSubjects();
    }
    //Admin API's
    else if (this.viewSection === 'adminAllUsers') {
      this.fetchAllUsers();
    }
    else if (this.viewSection === 'adminAllStudents') {
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
      this.fetchUserProfiles();
      this.fetchAdminDepartments();
      this.fetchRoles();
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
          this.fetchHodRequested();
          this.fetchHodApproved();
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
          this.fetchHodRequested();
          this.fetchHodRejected();
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
            courseName: ''
          };
          this.fetchHodToStaff(); // Assuming this method reloads the staff list
          this.showSwal('success', "Staff Created Successfully", "Ask Admin To Create Login Credentials"); // Show success message
        },
        error: (err) => {
          console.error('Create staff error:', err);
          const errorMessage = err?.error?.message || 'Something went wrong';
          this.showSwal('error', "Failed to create staff", errorMessage); // Show error message
        }
      });
  }

  submitCreateSubject() {
    const params = new HttpParams().set('subjectName', this.newSubjectName);
    this.http.post('http://localhost:8080/hod/createSubject', null, {
      headers: this.authService.getAuthHeaders().headers,
      params
    }).subscribe(() => {
      this.toast.showSuccess('Subject created');
      this.newSubjectName = '';
      this.fetchHodSubjects();
    });
  }

  submitCreateCourse() {
    const params = new HttpParams().set('courseName', this.newCourseName);
    this.http.post('http://localhost:8080/hod/createCourse', null, {
      headers: this.authService.getAuthHeaders().headers,
      params
    }).subscribe(() => {
      this.toast.showSuccess('Course created');
      this.newCourseName = '';
      this.fetchHodCourses();
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

  openEditStudentModal(student: any) {
    console.log('Editing student:', student); // Debug log

    if (!student || !student.id) {
      this.toast.showError('Invalid student selected.');
      return;
    }

    this.selectedStudentId = student.id;

    this.studentEdit = {
      name: student.name || '',
      age: student.age || null,
      gender: student.gender || '',
      email: '',
      phoneNumber: student.phoneNumber || '',
      profileImage: null,
      marksheetImage: null,
      active: student.active || '',
      subjectId: student.subjectId ?? null,
      courseId: student.courseId ?? null,
      departmentId: student.departmentId ?? null,
      courseStatus: student.courseStatus || '',
    };

    const modalElement = document.getElementById('editStudentModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      this.fetchHodCourses(); // Load courses for dropdown
      this.fetchAdminDepartments(); // Load departments for dropdown
      this.fetchSubjects();
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
      password: user.password || '',
      roleid: user.id || null

    };
    const modalUser = document.getElementById('editUserModal');
    if (modalUser) {
      const modal = new bootstrap.Modal(modalUser);
      modal.show();
    }
  }
  fetchSubjects() {
    this.http.get<any[]>('http://localhost:8080/admin/getAllSubjects', this.authService.getAuthHeaders())
      .subscribe({
        next: (data) => this.subjects = data,
        error: () => this.toast.showError('Failed to load subjects')
      });
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
    if (this.studentEdit.subjectId) formData.append('subjectId', this.studentEdit.subjectId.toString());
    if (this.studentEdit.active) formData.append('status', this.studentEdit.active);
    if (this.studentEdit.courseStatus) formData.append('courseStatus', this.studentEdit.courseStatus.toString());
    if (this.studentEdit.profileImage) formData.append('profileImage', this.studentEdit.profileImage);
    if (this.studentEdit.marksheetImage) formData.append('marksheetImage', this.studentEdit.marksheetImage);

    this.http.patch(
      `http://localhost:8080/hod/UpdateStudents/${this.selectedStudentId}`,
      formData,
      { headers: this.authService.getAuthHeaders().headers }
    ).subscribe({
      next: () => {
        this.toast.showSuccess('Student updated successfully');
        this.fetchHodApproved();
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


  deleteSubject(id: number) {
    this.http.delete(`http://localhost:8080/hod/deleteSubject/${id}`, this.authService.getAuthHeaders())
      .subscribe(() => {
        this.toast.showSuccess('Subject deleted');
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

  deleteCourse(id: number) {
    this.http.delete(`http://localhost:8080/hod/deleteCourse/${id}`, this.authService.getAuthHeaders())
      .subscribe(() => {
        this.toast.showSuccess('Course deleted');
        this.fetchCourses();
      });
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
  //--------------------------------------Student Completed------------------------------------------------------------------//

  //Admin Api's

  fetchAllUsers() {
    this.http.get<any>('http://localhost:8080/admin/getAllUsers', {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    }).subscribe({
      next: (res) => {
        this.allUsers = res;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

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
    if (this.studentEdit.active) formData.append('studentStatus', this.studentEdit.active);
    if (this.studentEdit.courseStatus) formData.append('courseStatus', this.studentEdit.courseStatus.toString());
    if (this.studentEdit.profileImage) formData.append('profileImage', this.studentEdit.profileImage);
    if (this.studentEdit.marksheetImage) formData.append('marksheetImage', this.studentEdit.marksheetImage);
    console.log('Updating student with data:', this.studentEdit)
    this.http.patch(
      `http://localhost:8080/admin/UpdateStudents/${this.selectedStudentId}`,
      formData,
      { headers: this.authService.getAuthHeaders().headers }
    ).subscribe({
      next: () => {
        console.log("Data updated");

        this.toast.showSuccess('Student updated successfully');
        this.loadAllStudents();
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
        Swal.fire('Success', 'User created successfully.', 'success');
        this.newUser = { username: '', password: '', roleId: null }; // reset form if needed
      },
      error: err => {
        Swal.fire('Error', err.error?.message || 'Failed to create user', 'error');
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

  submitCreateUserPro(): void {
    this.http.post('http://localhost:8080/admin/createUser', this.newUser).subscribe({
      next: () => {
        this.showSwal('success', 'Success', 'User created successfully');
        this.resetNewUser();
        this.closeModal();
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
      role: '',
      departmentId: null,
      subjectId: null,
      courseId: null
    };
  }

  closeModal(): void {
    const modal = document.getElementById('createUserModal');
    const backdrop = document.querySelector('.modal-backdrop');
    modal?.classList.remove('show');
    modal?.setAttribute('style', 'display: none;');
    backdrop?.remove();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
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
    this.http.delete(`http://localhost:8080/admin//deleteUserPro/${userProId}`).subscribe({
      next: (res) => {
        Swal.fire('Success', 'User deleted successfully.', 'success');
        this.fetchAllUsers(); // Refresh the user list
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


  // Filter parameters
  searchText: string = '';
  filterRole: string = '';
  filterDepartment: string | null = null;

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

    if (this.filterDepartment) {
      params = params.set('departmentId', this.filterDepartment.toString());
    }

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

  onFilterChange(): void {
    this.page = 0;
    this.fetchUsers();
  }


  onPageChange(newPage: number) {
    this.page = newPage;
    this.fetchUsers();
  }


  addUser() {
    // Navigate to add-user form or open modal
  }

}
