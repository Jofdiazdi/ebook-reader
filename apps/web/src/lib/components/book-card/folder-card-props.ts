/**
 * @license BSD-3-Clause
 * Copyright (c) 2026, ッツ Reader Authors
 * All rights reserved.
 */

export interface FolderCardProps {
  id: number;
  name: string;
  coverStack?: (string | Blob)[]; // URLs or Blobs of book covers inside the folder
}
