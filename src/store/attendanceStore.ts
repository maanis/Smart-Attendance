interface Session {
  id: string;
  subject: string;
  course: string;
  year: string;
  division: string;
  radius: number;
  duration: number;
  teacherName: string;
  status: 'open' | 'closed';
  createdAt: Date;
  attendees: Array<{
    rollNo: string;
    name: string;
    time: string;
    status: 'present' | 'absent';
  }>;
}

interface AttendanceStore {
  sessions: Record<string, Session>;
  currentSession: string | null;
  currentStudentSubmission: {
    sessionId: string;
    rollNo: string;
    name: string;
    time: string;
    status: 'success' | 'already_submitted' | 'session_closed';
  } | null;
}

class AttendanceStoreManager {
  private store: AttendanceStore = {
    sessions: {},
    currentSession: null,
    currentStudentSubmission: null,
  };

  createSession(sessionData: Omit<Session, 'id' | 'status' | 'createdAt' | 'attendees'>): string {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    this.store.sessions[id] = {
      ...sessionData,
      id,
      status: 'open',
      createdAt: new Date(),
      attendees: [],
    };
    this.store.currentSession = id;
    return id;
  }

  getSession(id: string): Session | null {
    return this.store.sessions[id] || null;
  }

  closeSession(id: string): boolean {
    if (this.store.sessions[id]) {
      this.store.sessions[id].status = 'closed';
      return true;
    }
    return false;
  }

  markAttendance(sessionId: string, rollNo: string, name: string): 'success' | 'already_submitted' | 'session_closed' {
    const session = this.store.sessions[sessionId];
    
    if (!session) {
      return 'session_closed';
    }

    if (session.status === 'closed') {
      return 'session_closed';
    }

    // Check if already submitted
    const existingAttendee = session.attendees.find(a => a.rollNo === rollNo);
    if (existingAttendee) {
      this.store.currentStudentSubmission = {
        sessionId,
        rollNo,
        name,
        time: existingAttendee.time,
        status: 'already_submitted',
      };
      return 'already_submitted';
    }

    // Add new attendee
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    session.attendees.push({
      rollNo,
      name,
      time,
      status: 'present',
    });

    this.store.currentStudentSubmission = {
      sessionId,
      rollNo,
      name,
      time,
      status: 'success',
    };

    return 'success';
  }

  getCurrentSession(): Session | null {
    return this.store.currentSession ? this.store.sessions[this.store.currentSession] : null;
  }

  getCurrentStudentSubmission() {
    return this.store.currentStudentSubmission;
  }

  clearCurrentStudentSubmission() {
    this.store.currentStudentSubmission = null;
  }

  // Add some dummy data for demonstration
  initializeDummyData() {
    const dummySession = this.createSession({
      subject: 'Computer Networks',
      course: 'MCA',
      year: 'SY',
      division: 'A',
      radius: 50,
      duration: 60,
      teacherName: 'Dr. Smith',
    });

    // Add some dummy attendees
    this.store.sessions[dummySession].attendees = [
      { rollNo: 'MCA001', name: 'John Doe', time: '09:05 AM', status: 'present' },
      { rollNo: 'MCA002', name: 'Jane Smith', time: '09:07 AM', status: 'present' },
      { rollNo: 'MCA003', name: 'Mike Johnson', time: '09:12 AM', status: 'present' },
    ];
  }
}

export const attendanceStore = new AttendanceStoreManager();

// Initialize with dummy data
attendanceStore.initializeDummyData();