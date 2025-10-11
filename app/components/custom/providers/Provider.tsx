'use client'

import { PropsWithChildren } from 'react';
import Amplify from 'aws-amplify'
import outputs from '@/amplify_outputs.json'

Amplify.configure(outputs);

export default function Providers({children}: PropsWithChildren) {
    return <>{children}</>
}