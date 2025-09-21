import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import useSession from "@/hooks/useSession";
import {
  ArrowLeft, Download, Users, Calendar, Clock, Loader2, AlertCircle, Search, ChevronsUpDown, ArrowUp, ArrowDown, FileSpreadsheet
} from "lucide-react";

// --- UI IMPROVEMENT: A dedicated component for the full-screen status pages ---
const StatusScreen = ({ icon, title, message, children }) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
    <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-8 text-center">
      <div className="flex justify-center">{icon}</div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{message}</p>
      {children}
    </div>
  </div>
);

// --- UI IMPROVEMENT: Small, focused stat cards for the summary bar ---
const StatCard = ({ icon, title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);


const AttendanceList = () => {
  const { sessionId } = useParams();
  const { data: session, isLoading, error } = useSession(sessionId);

  // --- FUNCTIONAL IMPROVEMENT: State for interactive table ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'rollNo', direction: 'ascending' });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const navigate = useNavigate();

  // --- FUNCTIONAL IMPROVEMENT: Memoized and processed data for the table ---
  const processedAttendance = useMemo(() => {
    if (!session?.attendance) return [];

    let filteredData = session.attendance.filter(attendee =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return filteredData;
  }, [session?.attendance, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return processedAttendance.slice(start, end);
  }, [processedAttendance, pagination]);


  // --- FUNCTIONAL IMPROVEMENT: Real CSV export functionality ---
  const handleExportCSV = () => {
    if (!session?.attendance || session.attendance.length === 0) {
      toast.error("No Data to Export", { description: "There are no attendance records for this session." });
      return;
    }

    const headers = ["Roll No", "Name", "Timestamp"];
    const rows = session.attendance.map(att => [
      att.rollNo,
      att.name,
      new Date(att.timestamp).toLocaleString(),
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `attendance-report-${session.sessionId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Export Successful", { description: "The attendance report has been downloaded." });
  };

  // --- FUNCTIONAL IMPROVEMENT: Excel export functionality ---
  const handleExportExcel = async () => {
    if (!session?.attendance || session.attendance.length === 0) {
      toast.error("No Data to Export", { description: "There are no attendance records for this session." });
      return;
    }

    try {
      // Dynamically import xlsx library only when needed
      const XLSX = await import('xlsx');

      // Prepare data for Excel - only roll, name, and time
      const excelData = session.attendance.map(att => ({
        'Roll No': att.rollNo,
        'Name': att.name,
        'Time': new Date(att.timestamp).toLocaleString(),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const colWidths = [
        { wch: 12 }, // Roll No
        { wch: 25 }, // Name
        { wch: 20 }  // Time
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

      // Generate filename
      const filename = `attendance-report-${session.sessionId}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success("Excel Export Successful", { description: "The attendance report has been downloaded as an Excel file." });
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("Export Failed", { description: "Failed to export Excel file. Please try again." });
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // --- RENDER STATES (MODERNIZED) ---
  if (isLoading) {
    return <StatusScreen icon={<Loader2 className="h-10 w-10 animate-spin text-primary" />} title="Loading Report..." message="Fetching the attendance records." />;
  }

  console.log(error)

  if (error || !session) {
    return (
      <StatusScreen icon={<AlertCircle className="h-10 w-10 text-destructive" />} title="Failed to Load" message={error?.message || "The requested session could not be found."}>
        <Button onClick={() => navigate(-1)} className="w-full mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
      </StatusScreen>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* --- UI IMPROVEMENT: A clean page header instead of a card --- */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Attendance Report</h1>
              <p className="text-sm text-muted-foreground">{session.subject} - {session.course} {session.year} Div {session.division}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* --- UI IMPROVEMENT: A scannable stat bar --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users className="text-muted-foreground h-4 w-4" />} title="Total Present" value={session.attendance.length} />
          <StatCard icon={<Calendar className="text-muted-foreground h-4 w-4" />} title="Session Date" value={new Date(session.createdAt).toLocaleDateString()} />
          <StatCard icon={<Clock className="text-muted-foreground h-4 w-4" />} title="Time" value={new Date(session.createdAt).toLocaleTimeString()} />
          <StatCard icon={<Badge variant={session.isActive ? "default" : "destructive"}>{session.isActive ? 'Live' : 'Closed'}</Badge>} title="Status" value={session.isActive ? 'Active' : 'Closed'} />
        </div>

        {/* --- UI IMPROVEMENT: Interactive Attendance Table --- */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>A detailed list of all students who marked their attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or roll no..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('rollNo')}>
                        Roll No {sortConfig.key === 'rollNo' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />) : <ChevronsUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')}>
                        Name {sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />) : <ChevronsUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((attendee) => (
                      <TableRow key={attendee._id}>
                        <TableCell className="font-medium">{attendee.rollNo}</TableCell>
                        <TableCell>{attendee.name}</TableCell>
                        <TableCell className="font-mono text-xs">{attendee.deviceId.substring(0, 12)}...</TableCell>
                        <TableCell>{new Date(attendee.timestamp).toLocaleTimeString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
              <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex - 1 }))} disabled={pagination.pageIndex === 0}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }))} disabled={pagination.pageIndex * pagination.pageSize + pagination.pageSize >= processedAttendance.length}>Next</Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AttendanceList;