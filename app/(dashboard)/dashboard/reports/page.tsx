import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Scroll, Eye } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
export const revalidate = 60; // ISR: Revalidate every 60s

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  // Fetch astro reports
  const astroReports = await prisma.astroReport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">मेरी रिपोर्ट्स (My Reports)</h1>
        <p className="text-muted-foreground text-sm">View your Kundali, Horoscope, and Puja Sankalp reports here.</p>
      </div>

      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
          <CardTitle className="text-orange-900 text-lg">Astrology & Puja Reports</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {astroReports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {astroReports.map((report) => (
                <div key={report.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <Scroll className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {report.type.replace('_', ' ')}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Generated on: {new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold" asChild>
                      <a href={report.reportUrl || '#'} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Scroll className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-700">No Reports Available</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                You haven't requested any Kundali or Astrology reports yet. 
              </p>
              <Button asChild className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                <a href="/tools">Explore Astro Tools</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

