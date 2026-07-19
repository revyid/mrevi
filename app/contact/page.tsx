import { Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">
            Get in Touch
          </p>
          <h1 className="font-poppins text-5xl md:text-7xl font-bold tracking-tight">
            Let&apos;s <span className="text-primary">Connect</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Have a project in mind? I&apos;d love to hear about it. Whether
              it&apos;s a website redesign, a new app, or just a chat about
              design — feel free to reach out.
            </p>

            <div className="space-y-6">
              <Card className="bg-white/[0.03] border-white/[0.06]">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">hello@sawad.design</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.03] border-white/[0.06]">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Available Worldwide</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-white/[0.05] border-white/[0.08] focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-white/[0.05] border-white/[0.08] focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-sm font-medium text-muted-foreground"
              >
                Subject
              </label>
              <Input
                id="subject"
                placeholder="Project inquiry"
                className="bg-white/[0.05] border-white/[0.08] focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-muted-foreground"
              >
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Tell me about your project..."
                rows={6}
                className="bg-white/[0.05] border-white/[0.08] focus:border-primary resize-none"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-white hover:bg-accent/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
