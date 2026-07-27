"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  return (
    <form className="space-y-5">
      <div>
        <Input
          placeholder="Name"
          className="h-12 rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email"
          className="h-12 rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50"
        />
      </div>
      <div>
        <Select>
          <SelectTrigger className="h-12 w-full rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under-3k">{"< $3,000"}</SelectItem>
            <SelectItem value="3k-5k">$3,000 - $5,000</SelectItem>
            <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
            <SelectItem value="over-10k">{"> $10,000"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Textarea
          placeholder="Message"
          rows={5}
          className="rounded-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 resize-none"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12 rounded-lg bg-accent text-white font-medium text-base hover:opacity-90 transition-opacity"
      >
        Submit
      </Button>
    </form>
  );
}
