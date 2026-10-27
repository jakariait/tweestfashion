import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

export default function ProductBreadcrumbs({ product }) {
  return (
    <div className="px-4 py-3 md:px-6 overflow-x-auto scrollbar-none">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap whitespace-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <RouterLink
                to="/"
                className="flex items-center gap-1.5 text-sm  text-muted-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {product?.category?.name && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <RouterLink
                    to={`/shop?category=${product.category.name}`}
                    className="text-sm  text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.category.name}
                  </RouterLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {product?.subCategory?.name && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <RouterLink
                    to={`/shop?subcategory=${product.subCategory.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.subCategory.name}
                  </RouterLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {product?.childCategory?.name && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <RouterLink
                    to={`/shop?childCategory=${product.childCategory.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {product.childCategory.name}
                  </RouterLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {product?.name && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[160px] sm:max-w-[280px] truncate rounded-full bg-muted px-3 py-1 text-sm  text-foreground font-medium">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
