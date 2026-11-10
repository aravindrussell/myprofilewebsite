import type { PortfolioContent } from "../../types/profile";
import type { Edit } from "../useDraft";
import type { FieldErrors } from "../validation";

export interface EditorProps {
  draft: PortfolioContent;
  edit: Edit;
  errors: FieldErrors;
}
