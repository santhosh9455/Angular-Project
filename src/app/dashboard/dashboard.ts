import { Component, inject, OnInit } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { AuthService } from '../services/auth';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  constructor(
    private toast: ToastService,
  ) {
    
  }
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

  studentMessage: string = '';

  // ngOnInit() {
  //   this.userRoles = this.authService.getUserRole();
  //   console.log('User Roles:', this.userRoles);
  //   const name = this.authService.getUsername();

  //   if (name) {
  //     this.username = name.toUpperCase();
  //   }
  //   console.log('Logged in as:', this.username);
  // }

  // hasRole(role: string): boolean {
  //   return this.authService.getUserRole().includes(role);
  // }

  ngOnInit() {
  this.userRoles = this.authService.getUserRole();
  console.log('User Roles:', this.userRoles);

  const name = this.authService.getUsername();
  if (name) {
    this.username = name.toUpperCase();
  }

  console.log('Logged in as:', this.username);
  if (this.hasRole('ROLE_STAFF')) {
    console.log('✅ Staff role matched. Staff dashboard will be visible.');
  }
}

hasRole(role: string): boolean {
  return this.userRoles.includes(role);
}


  toggleSection(section: string) {
    this.viewSection = this.viewSection === section ? null : section;

    // Trigger data loading only when shown
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

    // Toggle section handler
    else if (this.viewSection === 'hodRequested') {
      this.fetchHodRequested();
    } else if (this.viewSection === 'hodApproved') {
      this.fetchHodApproved();
    } else if (this.viewSection === 'hodRejected') {
      this.fetchHodRejected();
    } else if (this.viewSection === 'hodSubjects') {
      this.fetchHodSubjects();
    } else if (this.viewSection === 'hodStaff') {
      this.fetchHodStaff();
    } else if (this.viewSection === 'hodCourses') {
      this.fetchHodCourses();
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
    this.http.get<any>('http://localhost:8080/staff/getPendingStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.pendingStudents = res;
          console.log(this.pendingStudents);
        },
        error: (err: any) => {
          console.error('Student List error:', err);
          this.studentMessage = 'Failed to load Student List.';
        }
      });

  }

  // Approve student
  approveStudent(studentId: number) {
    console.log("Approving student ID:", studentId);
    this.http.post(`http://localhost:8080/staff/approveStudent/${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          console.log("calling approve api")
          this.fetchPenddingStudent();
          this.fetchApprovedStudent();
        },
        error: (err) => console.error('Approval failed:', err)
      });
  }

  // Reject student
  rejectStudent(studentId: number) {
    this.http.post(`http://localhost:8080/staff/RejectStudent/${studentId}`, {}, this.authService.getAuthHeaders())
      .subscribe({
        next: () => {
          this.fetchPenddingStudent();
          this.fetchRejectedStudent();
        },
        error: (err) => console.error('Rejection failed:', err)
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

  // HOD APIs
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

  fetchHodStaff() {
    this.http.get<any[]>('http://localhost:8080/hod/getAllStaff', this.authService.getAuthHeaders())
      .subscribe({
        next: res => this.hodStaff = res,
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
      console.error('sTUDENT ALREADY APPROVED');
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
          this.toast.showError('Failed to approve student.');
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
          this.toast.showError('Failed to reject student.');
        }
      });
  }


  //Student API's
  fetchStudentProfile() {
    this.http.get<any>('http://localhost:8080/api/students/getStudent', this.authService.getAuthHeaders())
      .subscribe({
        next: (res: any) => {
          this.studentProfile = res;
          this.toast.showSuccess("Profile loaded successfully!");
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
}
