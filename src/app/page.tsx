"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center ">
      <section className="w-full py-12 md:py-24 lg:py-32 text-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4 text-left">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                  Welcome to TaskFlow
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Streamline your team’s productivity with TaskFlow. Effortlessly assign, track, and manage tasks for a more organized and efficient workflow.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/login/admin">
                    Admin Login <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                  <Link href="/login/employee">
                    Employee Login <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Task Management Illustration"
              data-ai-hint="team collaboration"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-xl"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose TaskFlow?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                TaskFlow is designed to be intuitive and powerful, providing the tools you need to keep your team on track and projects moving forward.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="w-6 h-6 text-primary" />
                  Efficient Task Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Admins can quickly assign tasks to employees, set priorities, and provide detailed descriptions.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-6 h-6 text-primary" />
                  Clear Employee Dashboards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Employees get a personalized view of their tasks, making it easy to see what needs to be done.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  Real-time Status Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Track task progress with clear status indicators (Pending, Active, Completed, Failed).</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
