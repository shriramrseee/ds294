#!/usr/bin/env python

# This example shows how to sample a mathematical function over a
# volume. A slice from the volume is then extracted and then contoured
# to produce 2D contour lines.
#
import vtk

# Quadric definition. This is a type of implicit function. Here the
# coefficients to the equations are set.
quadric = vtk.vtkQuadric()
quadric.SetCoefficients(.5, 1, .2, 0, .1, 0, 0, .2, 0, 0)

# The vtkSampleFunction uses the quadric function and evaluates function
# value over a regular lattice (i.e., a volume).
sample = vtk.vtkSampleFunction()
sample.SetSampleDimensions(30, 30, 30)
sample.SetImplicitFunction(quadric)
sample.ComputeNormalsOff()
sample.Update()

# Here a single slice (i.e., image) is extracted from the volume. (Note: in
# actuality the VOI request causes the sample function to operate on just the
# slice.)
extract = vtk.vtkExtractVOI()
extract.SetInputConnection(sample.GetOutputPort())
extract.SetVOI(0, 29, 0, 29, 15, 15)
extract.SetSampleRate(1, 2, 3)

# Create a greyscale lookup table
table = vtk.vtkLookupTable()
table.SetTableRange(0.0, 1.2)
table.Build()

# Map the image through the lookup table
color = vtk.vtkImageMapToColors()
color.SetLookupTable(table)
color.SetInputConnection(extract.GetOutputPort())

imageActor = vtk.vtkImageActor()
imageActor.GetMapper().SetInputConnection(color.GetOutputPort())

# Create outline an outline of the sampled data.
outline = vtk.vtkOutlineFilter()
outline.SetInputConnection(sample.GetOutputPort())

outlineMapper = vtk.vtkPolyDataMapper()
outlineMapper.SetInputConnection(outline.GetOutputPort())

outlineActor = vtk.vtkActor()
outlineActor.SetMapper(outlineMapper)
outlineActor.GetProperty().SetColor(0, 0, 0)

# Create the renderer, render window, and interactor.
ren = vtk.vtkRenderer()
renWin = vtk.vtkRenderWindow()
renWin.AddRenderer(ren)
iren = vtk.vtkRenderWindowInteractor()
iren.SetRenderWindow(renWin)

# Set the background color to white. Associate the actors with the
# renderer.
ren.SetBackground(1, 1, 1)
ren.AddActor(imageActor)
ren.AddActor(outlineActor)

# Zoom in a little bit.
ren.ResetCamera()
ren.GetActiveCamera().Zoom(1.5)

# Initialize and start the event loop.
iren.Initialize()
renWin.Render()
iren.Start()