"use client";

import { ShoppingBag, Trash2, ArrowRight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLms } from "@/lib/store";
import { courseMap } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/format";
import type { ReactNode } from "react";

export function CartDrawer({ children }: { children: ReactNode }) {
  const { items, removeFromCart, openCheckout, navigate, user, setAuthOpen } = useLms();

  const courses = items
    .map((i) => courseMap[i.courseId])
    .filter(Boolean);
  const total = courses.reduce((n, c) => n + c.price, 0);
  const savings = courses.reduce((n, c) => n + (c.comparePrice ? c.comparePrice - c.price : 0), 0);

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            Your Cart
            <Badge variant="secondary">{courses.length}</Badge>
            <SheetClose asChild>
              <button className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent">
                <X className="size-4" />
              </button>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>

        {courses.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Browse our courses to get started.</p>
            </div>
            <SheetClose asChild>
              <Button onClick={() => navigate("catalog")}>Explore Courses</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3 p-4">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={c.thumbnail} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{c.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-bold">{formatPrice(c.price, c.currency)}</span>
                        {c.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(c.comparePrice, c.currency)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            if (!user) {
                              setAuthOpen(true, "login");
                              return;
                            }
                            openCheckout(c.id);
                          }}
                        >
                          Checkout <ArrowRight className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(c.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-muted/30 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              {savings > 0 && (
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-emerald-500">You save</span>
                  <span className="font-semibold text-emerald-500">{formatPrice(savings)}</span>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Checkout each course individually to apply coupons.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
